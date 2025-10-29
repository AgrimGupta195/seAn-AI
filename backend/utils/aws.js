import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mime from "mime-types";

dotenv.config();

AWS.config.update({ region: process.env.AWS_REGION });

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

/**
 * Uploads any file type (e.g. .vtt, .srt, .doc, .docx, .pdf, .png, etc.) to AWS S3.
 * @param {string} filePath - Local file path
 * @param {string} [bucketName] - Optional bucket name (defaults to AWS_BUCKET_NAME)
 * @returns {Promise<string>} - The uploaded file's S3 URL
 */
export async function uploadFile(filePath, bucketName = process.env.AWS_BUCKET_NAME) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    // ✅ Automatically detect MIME type (fallback to binary)
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
      ContentType: contentType,
    };

    const result = await s3.upload(uploadParams).promise();

    return result.Location; // S3 file URL
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
}