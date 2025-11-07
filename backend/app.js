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

const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;

const allowedOrigins = [...defaultOrigins, ...envOrigins];
if (vercelOrigin) {
  allowedOrigins.push(vercelOrigin);
}

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(cookieParser());

app.use("/api/uploadFile", uploadRouter);
app.use("/api/user", userRouter);
app.use("/api", chatRouter);

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;

