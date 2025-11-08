import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import uploadRouter from "./router/uploadRouter.js";
import userRouter from "./router/userRouter.js";
import chatRouter from "./router/chatRouter.js";

dotenv.config();

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

// Add Vercel deployment URLs
const vercelUrl = process.env.VERCEL_URL;
const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;

const vercelOrigins = [];
if (vercelUrl) {
  vercelOrigins.push(`https://${vercelUrl}`);
}
if (vercelBranchUrl) {
  vercelOrigins.push(`https://${vercelBranchUrl}`);
}

const allowedOrigins = [...defaultOrigins, ...envOrigins, ...vercelOrigins];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(cookieParser());

app.use("/api/uploadFile", uploadRouter);
app.use("/api/user", userRouter);
app.use("/api", chatRouter);

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;

