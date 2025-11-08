import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import fetch from "node-fetch";
import FormData from "form-data";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(os.tmpdir(), "uploads");
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
  limits: { fileSize: 500 * 1024 * 1024 },
}).array("videos", 10);

async function extractAudioFromFile(videoPath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(videoPath), {
    filename: path.basename(videoPath),
    contentType: "video/mp4",
  });
  form.append("output_format", "mp3");

  const response = await fetch(`${PYTHON_SERVICE_URL}/extract-audio`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python audio extraction failed: ${errorText}`);
  }

  const result = await response.json();
  return result.s3_url;
}

async function transcribeAudio(audioPath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
  });

  const segments = transcription.segments.map(seg => ({
    start: seg.start,
    end: seg.end,
    text: seg.text,
  }));

  return { text: transcription.text, segments };
}

async function storeSegmentsInPinecone(segments, videoName, s3Url, id) {
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
        const audioS3Url = await extractAudioFromFile(file.path);
        const audioPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);
        
        const audioResponse = await fetch(audioS3Url);
        if (!audioResponse.ok) {
          throw new Error(`Failed to download audio from S3: ${audioResponse.statusText}`);
        }
        const audioArrayBuffer = await audioResponse.arrayBuffer();
        const audioBuffer = Buffer.from(audioArrayBuffer);
        fs.writeFileSync(audioPath, audioBuffer);
        
        const transcription = await transcribeAudio(audioPath);
        await storeSegmentsInPinecone(transcription.segments, file.filename, s3Url, req.user._id);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
        results.push({ fileName: file.originalname, s3Url, transcription });
      }

      res.json({
        message: `✅ ${results.length} video(s) uploaded, transcribed, and stored successfully!`,
        results,
      });
    } catch (error) {
      console.error("❌ Error processing videos:", error);
      res.status(500).json({ message: "Error processing videos", error: error.message });
    }
  });
};
