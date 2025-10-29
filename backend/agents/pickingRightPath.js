import { Agent, run, tool } from '@openai/agents';
import { Pinecone } from '@pinecone-database/pinecone';
import { z } from 'zod';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

// -------------------- Setup --------------------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// -------------------- Search Functions -------------------
async function search(userQuery, modifiedQuery, namespace) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: `${userQuery}\n${modifiedQuery}`,
    dimensions: 1024,
  });

  const embedding = embeddingResponse.data[0].embedding;
  const index = pinecone.index("seanai").namespace(namespace);

  const results = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  const answers = results.matches.map(match => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text || "No text found",
  }));

  const combinedContext = answers
    .slice(0, 3)
    .map((a, i) => `(${i + 1}) ${a.text}`)
    .join("\n\n");

  const bestAnswer = await correctAnswer(userQuery, modifiedQuery, combinedContext);
  return bestAnswer;
}

async function correctAnswer(query, modifiedQuery, context) {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: `
      Here is the user query: ${query}.
      Modified query by GPT: ${modifiedQuery}.
      Embedding-related context: ${context}.
      Write just the answer to the query directly, in limited words, without extra info.
    `
  });

  return response.output_text;
}

async function searchWithGPT(query, modifiedQuery) {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: `Write just the answer to the query: ${query} (Modified query: ${modifiedQuery}). Give answer directly, no extra info.`
  });

  return response.output_text;
}

async function finalAnswer(res1, res2, query, modifiedQuery) {
  const response = await openai.responses.create({
    model: "gpt-5",
    input: `
      You have two responses: ${res1} AND ${res2}.
      User query: ${query}, Modified query: ${modifiedQuery}.
      Blend them into a correct, concise answer. Do not give extra info, output directly.
    `
  });

  return response.output_text;
}

// -------------------- Tools --------------------
const directSearch = tool({
  name: 'direct Search',
  description: "Search for related info like timestamps and video links",
  parameters: z.object({ query: z.string(), modifiedQuery: z.string(), id: z.string() }),
  async execute({ query, modifiedQuery, id }) {
    return await search(query, modifiedQuery, id);
  },
});

const hybridSearch = tool({
  name: 'hybrid Search',
  description: "Search for document-related info",
  parameters: z.object({ query: z.string(), modifiedQuery: z.string(), id: z.string() }),
  async execute({ query, modifiedQuery, id }) {
    const res1 = await searchWithGPT(query, modifiedQuery);
    const res2 = await search(query, modifiedQuery, id);
    return await finalAnswer(res1, res2, query, modifiedQuery);
  },
});

// -------------------- Agent & SearchBox --------------------
export async function searchBox(query, modifiedQuery, id) {
  const agent = Agent.create({
    name: 'Search Agent',
    model: 'gpt-4.1-mini',
    tools: [directSearch, hybridSearch],
    instructions: `
      You are a search agent.
      If the query is related to timestamps or video links, call directSearch.
      If the query is related to documents, call hybridSearch.
    `
  });
  const result = await run(agent, { query, modifiedQuery, id });
  return result.finalOutput;
}
