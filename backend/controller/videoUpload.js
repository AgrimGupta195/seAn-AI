import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import extractAudio from "ffmpeg-extract-audio";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

// ------------------ Setup ------------------
const s3 = new S3Client({ region: process.env.AWS_REGION });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// ------------------ Upload file to S3 ------------------
async function uploadFileToS3(filePath, fileName) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  };
  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

// ------------------ Multer (Video Upload) ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const videoFileFilter = (req, file, cb) => {
  const allowedExtensions = [".mp4", ".mov", ".avi", ".mkv"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) return cb(new Error("Only video files are allowed!"));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
}).array("videos", 10);

// ------------------ Extract Audio ------------------
async function extractAudioFromFile(videoPath, outputPath) {
  await extractAudio({ input: videoPath, output: outputPath });
  return outputPath;
}

async function extractAudioFromUrl(videoUrl, outputPath) {
  const tempPath = path.join("temp_" + Date.now() + ".mp4");

  // Download video
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

  const fileStream = fs.createWriteStream(tempPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  // Extract audio
  await extractAudio({ input: tempPath, output: outputPath });

  fs.unlinkSync(tempPath); // Cleanup temp video
  return outputPath;
}

// ------------------ Transcribe with Whisper ------------------
async function transcribeAudio(audioPath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json", // timestamps included
  });

  const segments = transcription.segments.map(seg => ({
    start: seg.start,
    end: seg.end,
    text: seg.text,
  }));

  return { text: transcription.text, segments };
}

// ------------------ Store in Pinecone ------------------
async function storeSegmentsInPinecone(segments, videoName, s3Url,id) {
  const index = pinecone.index("seanai").namespace(id);

  const vectors = await Promise.all(
    segments.map(async (seg, i) => {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: seg.text,
        dimensions: 1024,
      });

      return {
        id: `${videoName}-${i}`,
        values: embeddingResponse.data[0].embedding,
        metadata: {
          text: seg.text,
          source: videoName,
          s3Url,
          start: seg.start,
          end: seg.end,
        },
      };
    })
  );

  await index.upsert(vectors);
  console.log(`✅ Stored ${vectors.length} segments in Pinecone`);
}

// ------------------ Controller for Uploaded Videos ------------------
export const uploadVideosAndTranscribe = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No video files uploaded" });

    try {
      const results = [];

      for (const file of req.files) {
        console.log(`🎥 Processing video: ${file.originalname}`);
        const s3Url = await uploadFileToS3(file.path, file.filename);
        const audioPath = path.join("uploads", `audio_${Date.now()}.mp3`);
        await extractAudioFromFile(file.path, audioPath);
        const transcription = await transcribeAudio(audioPath);
        await storeSegmentsInPinecone(transcription.segments, file.filename, s3Url,req.user._id);
        fs.unlinkSync(file.path);
        fs.unlinkSync(audioPath);
        results.push({ fileName: file.originalname, s3Url, transcription });
      }

      res.json({
        message: "✅ Videos uploaded, transcribed, and stored in Pinecone successfully!",
        results,
      });
    } catch (error) {
      console.error("❌ Error processing videos:", error);
      res.status(500).json({ message: "Error processing videos", error: error.message });
    }
  });
};

// ------------------ Process Video from URL ------------------
export async function processVideoUrl(videoUrl) {
  try {
    const videoName = "video_" + Date.now() + path.extname(videoUrl.split("/").pop());

    // 1️⃣ Extract audio
    const audioPath = path.join("uploads", `audio_${Date.now()}.mp3`);
    await extractAudioFromUrl(videoUrl, audioPath);

    // 2️⃣ Upload video to S3
    const tempVideoPath = path.join("uploads", videoName);
    const response = await fetch(videoUrl);
    const fileStream = fs.createWriteStream(tempVideoPath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
    const s3Url = await uploadFileToS3(tempVideoPath, videoName);
    const transcription = await transcribeAudio(audioPath);
    await storeSegmentsInPinecone(transcription.segments, videoName, s3Url);
    fs.unlinkSync(audioPath);
    fs.unlinkSync(tempVideoPath);
    return { fileName: videoName, s3Url, transcription };
  } catch (err) {
    console.error("❌ Error processing video URL:", err);
    throw err;
  }
}
