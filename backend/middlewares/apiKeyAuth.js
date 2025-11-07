import User from "../models/userModel.js";

export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"] || req.headers["api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
    
    if (!apiKey) {
      return res.status(401).json({ message: "API key is required. Send it in 'x-api-key' header." });
    }

    const user = await User.findOne({ key: apiKey }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("API key auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
