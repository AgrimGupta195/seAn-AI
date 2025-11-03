import multer from "multer";
import fs from "fs";
import path from "path";
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
const s3 = new S3Client({ region: process.env.AWS_REGION });

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
    const uploadPath = "uploads/";
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

// ------------------ Text Extraction ------------------
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
    return content.replace(
      /\d+\n\d{2}:\d{2}:\d{2},?\d* --> \d{2}:\d{2}:\d{2},?\d*\n/g,
      ""
    );
  }

  // fallback
  return fs.readFileSync(filePath, "utf8");
}

// ------------------ Chunking ------------------
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
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
export const uploadFilesSRTVTT = (req, res) => {

  upload(req, res, async (err) => {
    if (err)
      return res.status(500).json({ message: "Upload error", error: err.message });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });
    if(!req.links || req.links.length===0)
         return res.status(400).json({ message: "No Links uploaded" });
    try {
      const allVectors = [];

      for (const i =0; i< req.files.length; i++) {
        const file = req.files[i];
        const link = req.links[i];
        console.log(`📄 Processing ${file.originalname}`);

        // 1️⃣ Extract text
        const text = await extractText(file.path);
        const chunks = chunkText(text+`\n Source Link: ${link}`);

        // 2️⃣ Upload to S3
        const s3Url = await uploadFileToS3(file.path, file.filename);

        // 3️⃣ Generate embeddings
        const embeddings = await embedChunks(chunks, file.originalname, s3Url);
        allVectors.push(...embeddings);

        // 4️⃣ Store in Pinecone
        await storeVectorsInPinecone(embeddings,req.user._id);

        // 5️⃣ Delete temp file
        fs.unlinkSync(file.path);
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
