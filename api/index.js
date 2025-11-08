import app from "../backend/app.js";
import connectDB from "../backend/lib/db.js";

// Connect to database on cold start
let dbConnected = false;

export default async function handler(req, res) {
  try {
    // Connect to database if not already connected
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    
    // Handle the request with Express app
    // Wrap in a promise to ensure proper async handling
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("API handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
    throw error;
  }
}

