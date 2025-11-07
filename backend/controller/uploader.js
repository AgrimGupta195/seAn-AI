import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import pdf from "pdf-parse-debugging-disabled";

dotenv.config();

// ------------------ OpenAI + Pinecone setup ------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// ------------------ AWS S3 setup ------------------
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(filePath, fileName) {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
  };
  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

// ------------------ Multer setup ------------------
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

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
}).array("files", 10);

// ------------------ Text Extraction with Timestamp Preservation ------------------
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") return fs.readFileSync(filePath, "utf8");

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  if (ext === ".docx" || ext === ".doc") {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default;
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value;
  }

  if (ext === ".srt" || ext === ".vtt") {
    const content = fs.readFileSync(filePath, "utf8");
    // Parse SRT/VTT and preserve timestamps
    return parseSubtitleWithTimestamps(content, ext);
  }

  // fallback
  return fs.readFileSync(filePath, "utf8");
}

function parseSubtitleWithTimestamps(content, format) {
  const lines = content.split('\n');
  const segments = [];
  let currentSegment = { text: '', start: null, end: null };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Match timestamp pattern: 00:00:00,000 --> 00:00:00,000 or 00:00:00.000 --> 00:00:00.000
    const timestampMatch = line.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
    
    if (timestampMatch) {
      const startTime = parseFloat(timestampMatch[1]) * 3600 + 
                       parseFloat(timestampMatch[2]) * 60 + 
                       parseFloat(timestampMatch[3]) + 
                       parseFloat(timestampMatch[4]) / 1000;
      const endTime = parseFloat(timestampMatch[5]) * 3600 + 
                     parseFloat(timestampMatch[6]) * 60 + 
                     parseFloat(timestampMatch[7]) + 
                     parseFloat(timestampMatch[8]) / 1000;
      
      if (currentSegment.text) {
        segments.push(currentSegment);
      }
      
      currentSegment = { text: '', start: startTime, end: endTime };
    } else if (currentSegment.start !== null && !line.match(/^\d+$/)) {
      // Add text to current segment (skip sequence numbers)
      currentSegment.text += (currentSegment.text ? ' ' : '') + line;
    }
  }
  
  if (currentSegment.text) {
    segments.push(currentSegment);
  }
  
  // Return text with embedded timestamp info
  return segments.map(seg => 
    `${seg.text} [Timestamp: ${formatTimestamp(seg.start)}-${formatTimestamp(seg.end)}]`
  ).join('\n');
}

function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ------------------ Chunking with Timestamp Preservation ------------------
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const lines = text.split('\n');
  let currentChunk = '';
  
  for (const line of lines) {
    if (currentChunk.length + line.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      // Overlap: keep last part of previous chunk
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n' + line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

// ------------------ Embedding ------------------
async function embedChunks(chunks, fileName, s3Url) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: chunks,
    dimensions: 1024,
  });
  console.log("✅ Embedding vector length:", response.data[0].embedding.length);
  return response.data.map((item, i) => ({
    id: `${fileName}-${i}`,
    values: item.embedding,
    metadata: { text: chunks[i], source: fileName, s3Url },
  }));
}


// ------------------ Store in Pinecone ------------------
async function storeVectorsInPinecone(vectors,id) {
  const index = pinecone.index("seanai").namespace(id);
  await index.upsert(vectors);
  console.log(`✅ Stored ${vectors.length} vectors in Pinecone`);
}

// ------------------ Controller ------------------
export const uploadFiles = (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res.status(500).json({ message: "Upload error", error: err.message });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });

    try {
      const allVectors = [];

      for (const file of req.files) {
        console.log(`📄 Processing ${file.originalname}`);

        // 1️⃣ Extract text
        const text = await extractText(file.path);
        const chunks = chunkText(text);

        // 2️⃣ Upload to S3
        const s3Url = await uploadFileToS3(file.path, file.filename);

        // 3️⃣ Generate embeddings
        const embeddings = await embedChunks(chunks, file.originalname, s3Url);
        allVectors.push(...embeddings);

        // 4️⃣ Store in Pinecone
        await storeVectorsInPinecone(embeddings,req.user._id);

        // 5️⃣ Delete temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      res.json({
        message: "✅ Files uploaded and processed successfully!",
        totalVectors: allVectors.length,
      });
    } catch (error) {
      console.error("❌ Error uploading files:", error);
      res
        .status(500)
        .json({ message: "Error uploading files", error: error.message });
    }
  });
};
