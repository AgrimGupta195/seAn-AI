import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function search(userQuery, modifiedQuery, namespace) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: userQuery,
    dimensions: 1024,
  });

  const embedding = embeddingResponse.data[0].embedding;
  const index = pinecone.index("seanai").namespace(namespace);

  const results = await index.query({
    vector: embedding,
    topK: 3,
    includeMetadata: true,
  });

  const answers = results.matches.map(match => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text || "No text found",
    start: match.metadata?.start,
    end: match.metadata?.end,
    source: match.metadata?.source,
    s3Url: match.metadata?.s3Url,
  }));

  if (answers.length > 0 && answers[0].score > 0.8) {
    const topAnswer = answers[0];
    return { 
      answer: topAnswer.text.substring(0, 500),
      sources: [topAnswer] 
    };
  }

  const combinedContext = answers
    .slice(0, 2)
    .map((a, i) => `[${i + 1}] ${a.text}`)
    .join("\n\n");

  const bestAnswer = await correctAnswer(userQuery, combinedContext, answers);
  return { answer: bestAnswer, sources: answers.slice(0, 2) };
}

function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function correctAnswer(query, context, sources) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Answer questions using ONLY the provided context. Be concise."
      },
      {
        role: "user",
        content: `Question: "${query}"

Context:
${context}

Answer using ONLY the context above.`
      }
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  return response.choices[0].message.content;
}

async function searchWithGPT(query, modifiedQuery) {
  // This is only used for hybrid search, but we'll make it less important
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant. Provide a brief general answer."
      },
      {
        role: "user",
        content: `Briefly answer: ${query}`
      }
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0].message.content;
}

async function finalAnswer(res1, res2, query, modifiedQuery) {
  // res1 is GPT-only, res2 is from RAG (more reliable)
  // Prioritize res2 (RAG result) over res1
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful AI assistant that combines information from multiple sources. 
        
CRITICAL: The second response (RAG result) is from the user's knowledge base and is MORE RELIABLE. 
Prioritize the RAG result (second response) over the general answer (first response).
Only use the first response if it adds important context that's missing from the second response.`
      },
      {
        role: "user",
        content: `User Question: "${query}"

Response 1 (General): ${res1}

Response 2 (From Knowledge Base - PRIORITIZE THIS): ${res2}

Combine these responses, but prioritize Response 2 (from knowledge base) as it's more accurate and relevant. Only use Response 1 if it adds crucial missing context.`
      }
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}

// Determine if query is about timestamps/videos
async function isVideoQuery(query) {
  const videoKeywords = ['timestamp', 'time', 'when', 'where', 'video', 'minute', 'second', 'hour', 'at what time'];
  const lowerQuery = query.toLowerCase();
  return videoKeywords.some(keyword => lowerQuery.includes(keyword));
}

export async function searchBox(query, modifiedQuery, id) {
  try {
    const result = await search(query, modifiedQuery, id);
    return result;
  } catch (error) {
    console.error('SearchBox error:', error);
    throw error;
  }
}
