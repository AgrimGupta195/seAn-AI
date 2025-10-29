import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
dotenv.config();
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const indexName = 'seanai';
await pinecone.createIndexForModel({
  name: indexName,
  cloud: 'aws',
  region: 'us-east-1',
  embed: {
    model: 'llama-text-embed-v2',
    fieldMap: { text: 'chunk_text' },
  },
  waitUntilReady: true,
});



// async function fetchVectors() {
//   const index = pinecone.index("seanai");

//   // Fetch vectors by IDs (if you know them)
//   const idsToFetch = ["file1-0", "file1-1"];
//   const response = await index.fetch({ ids: idsToFetch });
//   console.log("Fetched vectors:", response);

//   // Or do a query with a random vector to see similar items
//   // const queryResponse = await index.query({ vector: someVector, topK: 5 });
//   // console.log(queryResponse);
// }

// fetchVectors();



