import { AzureKeyCredential, SearchIndexClient } from "@azure/search-documents";
import { format, subYears } from "date-fns";
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

// list all indexes
export const ListIndexes = async () => {
  const indexes = searchIndexClient.listIndexes();
  let indexNames: string[] = [];
  for await (const index of indexes) {
    indexNames.push(index.name);
  }
  return indexNames;
};

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
};

// index document

// load sample data
const LoadASampleDocumentToIndex = async (sampleData: any, indexName: string) => {
  const searchClient = searchIndexClient.getSearchClient(indexName);
  await searchClient.mergeOrUploadDocuments([document]);
};

// load bulk sample data
export const LoadBulkSampleDataToIndex = async (sampleData: any[], indexName: string) => {
  const searchClient = searchIndexClient.getSearchClient(indexName);
  await searchClient.mergeOrUploadDocuments(sampleData);
};

// search by age ranges
function getDateFromAge(age: number): string {
  const now = new Date();
  return format(subYears(now, age), "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

const facetQuery = [
  `identityDetails/dateOfBirth,values:
  ${getDateFromAge(65)}
  |${getDateFromAge(55)}
  |${getDateFromAge(45)}
  |${getDateFromAge(35)}
  |${getDateFromAge(25)}
  |${getDateFromAge(18)}`,
];

export async function SearchByAgeRanges(indexName: string) {
  const searchOptions = {
    facets: facetQuery,
  };

  const searchClient = searchIndexClient.getSearchClient(indexName);
  const searchResults = await searchClient.search("*", searchOptions);
  console.log(searchResults.facets);

  for await (const result of searchResults.results) {
    console.log(result);
  }

}
