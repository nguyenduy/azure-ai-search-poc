import { AzureKeyCredential, SearchIndexClient } from "@azure/search-documents";
import { format, subDays, subYears } from "date-fns";
import dotenv from "dotenv";
import { AreSameBirthdays, getDateFromAge } from "./helpers";

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

// load a sample document into index
const LoadASampleDocumentToIndex = async (sampleData: any, indexName: string) => {
  const searchClient = searchIndexClient.getSearchClient(indexName);
  await searchClient.mergeOrUploadDocuments([document]);
};

// load bulk sample documents into index
export const LoadBulkSampleDataToIndex = async (sampleData: any[], indexName: string) => {
  const searchClient = searchIndexClient.getSearchClient(indexName);
  await searchClient.mergeOrUploadDocuments(sampleData);
};

// search by age ranges

export async function SearchByAgeRanges(indexName: string, ageRangeInput: string) {
  const ageRanges = ageRangeInput.split(","); // ["18-30", "31-40", "41-50", "65+"]

  // Create a dictionary of age ranges to date ranges
  const dateRangesFromAgeRanges: { [key: string]: { from?: string; to: string } } = {};
  ageRanges.forEach((ageRange) => {
    if (ageRange.endsWith("+")) {
      const startAge = parseInt(ageRange.replace("+", ""), 10);
      dateRangesFromAgeRanges[ageRange] = { to: getDateFromAge(startAge) };
    } else {
      const [startAge, endAge] = ageRange
        .split("-")
        .map((age) => parseInt(age, 10))
        .sort((a, b) => b - a);
      dateRangesFromAgeRanges[ageRange] = {
        from: getDateFromAge(startAge),
        to: getDateFromAge(endAge),
      };
    }
  });

  // Flatten the array and remove duplicates
  const sortedUniqueAges = Array.from(new Set(ageRanges.flatMap((range) => range.split("-").map((age) => age.replace("+", "")))))
    .map((str) => parseInt(str))
    .sort((a, b) => b - a);

  const datesQueryString = sortedUniqueAges.map((age) => getDateFromAge(age)).join("|");
  const facetQuery = [`identityDetails/dateOfBirth,values:${datesQueryString}`];

  const searchOptions = { facets: facetQuery };
  const searchClient = searchIndexClient.getSearchClient(indexName);
  const searchResults = await searchClient.search("*", searchOptions);

  const facetsByAgeRange: { [key: string]: any } = {};
  if (searchResults.facets) {
    for (const facet of searchResults.facets["identityDetails/dateOfBirth"]) {
      const ageRange = Object.keys(dateRangesFromAgeRanges).find((key) => {
        const range = dateRangesFromAgeRanges[key];
        return (!range.from || AreSameBirthdays(range.from, facet.from)) && AreSameBirthdays(range.to, facet.to);
      });
      if (ageRange) {
        facetsByAgeRange[ageRange] = facet.count;
      }
    }
  }

  console.log(facetsByAgeRange);
  console.log(searchResults.facets);

  // Uncomment to log search results
  // for await (const result of searchResults.results) {
  //   console.log(result);
  // }
}

// search by date ranges (today, yesterday, last week, last month, last year) on createdAt field
export async function SearchByTimeFrames(indexName: string, timeFramesInput: string) {
  const timeFrames = timeFramesInput.split(",").reverse(); // ["today", "yesterday", "lastWeek", "lastMonth", "lastYear"]
  // get date ranges for time frames
  const now = new Date();
  const timeFrameToDate: { [key: string]: string } = {
    today: format(now, "yyyy-MM-dd'T'00:00:00'Z'"),
    yesterday: format(subDays(now, 1), "yyyy-MM-dd'T'00:00:00'Z'"),
    lastWeek: format(subDays(now, 7), "yyyy-MM-dd'T'00:00:00'Z'"),
    lastMonth: format(subDays(now, 30), "yyyy-MM-dd'T'00:00:00'Z'"),
    lastYear: format(subDays(now, 365), "yyyy-MM-dd'T'00:00:00'Z'"),
  };
  
  const dateRanges: { [key: string]: { from?: string; to?: string } } = {
    today: { from: timeFrameToDate["today"] },
    yesterday: { from: timeFrameToDate["yesterday"], to: timeFrameToDate["today"] },
    lastWeek: { from: timeFrameToDate["lastWeek"], to: timeFrameToDate["today"] },
    lastMonth: { from: timeFrameToDate["lastMonth"], to: timeFrameToDate["today"] },
    lastYear: { from: timeFrameToDate["lastYear"], to: timeFrameToDate["today"] },
  };

  // Create a dictionary of time frames to date ranges
  const dateRangesFromTimeFrames: { [key: string]: { from?: string; to?: string } } = {};
  timeFrames.forEach((timeFrame) => {
    dateRangesFromTimeFrames[timeFrame] = dateRanges[timeFrame];
  });

  // create facet query
  const facetQuery = [`createdAt,values:${timeFrames.map((timeFrame) => timeFrameToDate[timeFrame]).join("|")}`];
  const searchOptions = { facets: facetQuery };
  const searchClient = searchIndexClient.getSearchClient(indexName);
  const searchResults = await searchClient.search("*", searchOptions);
  console.log(searchResults.facets);
}
