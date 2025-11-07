import OpenAI from "openai";
import { searchBox } from "../agents/pickingRightPath.js";
import dotenv from "dotenv";

dotenv.config();

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required and must be a string" });
    }

    const userId = req.user._id.toString();
    const searchResult = await searchBox(message, message, userId);

    let answer;
    let sources = [];

    if (typeof searchResult === 'string') {
      answer = searchResult;
    } else if (searchResult && searchResult.answer) {
      answer = searchResult.answer;
      sources = searchResult.sources || [];
    } else {
      answer = JSON.stringify(searchResult);
    }

    let formattedResponse = answer;
    
    if (sources.length > 0) {
      const timestampInfo = sources
        .filter(src => src.start !== undefined)
        .map((src, idx) => {
          const timestamp = formatTimestamp(src.start);
          return `[${idx + 1}] Found at ${timestamp} in ${src.source || 'video'}`;
        })
        .join('\n');

      if (timestampInfo) {
        formattedResponse += `\n\n📹 Timestamps:\n${timestampInfo}`;
      }
    }

    res.json({
      answer: formattedResponse,
      sources: sources.map(src => ({
        text: src.text?.substring(0, 200) + (src.text?.length > 200 ? '...' : ''),
        timestamp: src.start !== undefined ? formatTimestamp(src.start) : null,
        source: src.source,
        score: src.score,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Error processing chat request", error: error.message });
  }
};

function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
