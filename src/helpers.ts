import { format, subYears } from "date-fns";
import { promises as fs } from "fs";

// Function to read and parse JSON file
export async function ReadJsonFile(filePath: string): Promise<any> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  return jsonData;
}

export function getDateFromAge(age: number): string {
  const now = new Date();
  return format(subYears(now, age), "yyyy-MM-dd'T'00:00:00'Z'");
}

export function convertDateRangeBucketsIntoAgeRanges(buckets: any[]): string[] {
  return buckets.map((bucket) => {
    const from = bucket.from ? getDateFromAge(bucket.from) : "*";
    const to = bucket.to ? getDateFromAge(bucket.to) : "*";
    return `${from}-${to}`;
  });
}

export function AreSameBirthdays(a: string, b: string): boolean {
  // Compare birth dates, only year, month, and day are considered
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth() && dateA.getDate() === dateB.getDate();
}
