import { AzureKeyCredential, SearchIndexClient } from "@azure/search-documents";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const endpoint = process.env.SEARCH_API_ENDPOINT;
const searchAPIKey = process.env.SEARCH_API_KEY;

if (!endpoint || !searchAPIKey) {
  throw new Error("Missing required environment variables");
}

const credentials = new AzureKeyCredential(searchAPIKey);
const searchIndexClient = new SearchIndexClient(endpoint, credentials);

// check if index exists
export const IndexExists = async (indexName: string) => {
  const indexes = searchIndexClient.listIndexes();
  for await (const index of indexes) {
    if (index.name === indexName) {
      return true;
    }
  }
};

// create index (if not exists)
export const CreateIndex = async (indexDefinition: any) => {
  const indexName = indexDefinition.name;
  const exists = await IndexExists(indexName);
  if (exists) {
    throw new Error(`Index '${indexName}' already exists.`);
  }

  await searchIndexClient.createIndex(indexDefinition);
  return indexName;
};

// update index (if exists)

// delete index (if exists)
export const DeleteIndex = async (indexName: string) => {
  const exists = await IndexExists(indexName);
  if (!exists) {
    throw new Error(`Index '${indexName}' does not exist.`);
  }

  await searchIndexClient.deleteIndex(indexName);
};

// update index (if exists)
export const UpdateIndexDefinition = async (indexDefinition: any) => {
  const indexName = indexDefinition.name;
  const exists = await IndexExists(indexName);
  if (!exists) {
    throw new Error(`Index '${indexName}' does not exist.`);
  }

  await searchIndexClient.createOrUpdateIndex(indexDefinition);
  return indexName;
}

// index document

// 


// search
