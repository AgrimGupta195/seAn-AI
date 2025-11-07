import app from "../backend/app.js";
import connectDB from "../backend/lib/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

