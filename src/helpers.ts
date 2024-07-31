import { promises as fs } from "fs";

// Function to read and parse JSON file
export async function ReadJsonFile(filePath: string): Promise<any> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);
  return jsonData;
}
