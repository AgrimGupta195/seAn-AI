import fetch from "node-fetch";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
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

export const processYouTubeVideo = async (req, res) => {
  try {
    const { video_url } = req.body;
    if (!video_url) {
      return res.status(400).json({ message: "YouTube URL is required" });
    }

    console.log(`🎥 Processing YouTube video: ${video_url}`);

    const transcriptResponse = await fetch(`${PYTHON_SERVICE_URL}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url }),
    });

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.json();
      return res.status(transcriptResponse.status).json({ message: error.detail || "Failed to get transcript" });
    }

    const transcriptData = await transcriptResponse.json();
    const segments = transcriptData.segments || [];

    if (segments.length === 0) {
      return res.status(400).json({ message: "No transcript segments found" });
    }

    const videoId = transcriptData.video_id;
    const videoName = `youtube_${videoId}`;
    const s3Url = `https://youtube.com/watch?v=${videoId}`;

    await storeSegmentsInPinecone(segments, videoName, s3Url, req.user._id);

    res.json({
      message: "✅ YouTube video processed and stored successfully!",
      video_id: videoId,
      segments_count: segments.length,
      s3Url,
    });
  } catch (error) {
    console.error("❌ Error processing YouTube video:", error);
    res.status(500).json({ message: "Error processing YouTube video", error: error.message });
  }
};
