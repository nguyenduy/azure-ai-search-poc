import readline from "readline";
import dotenv from "dotenv";
import { CreateIndex, DeleteIndex, IndexExists } from "./azure-ai-search-service"; // Ensure this is the correct path and file name
import path from "path";
import { ReadJsonFile } from "./helpers";
import { SearchIndex } from "@azure/search-documents";

const chalk = require("chalk");

// Load environment variables from .env and .env.local
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

// Create readline interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Event listener for 'close' event
rl.on("close", () => {
  console.log("Goodbye!");
  process.exit(0);
});

const printSeparatorForSection = (title: string) => {
  console.log("*******************************");
  console.log(title);
};

const printSuccessMessage = (message: string) => {
  console.log(chalk.green(message));
};

const printErrorMessage = (message: string) => {
  console.log(chalk.red(message));
};

// check if index exists
async function handleCheckIndexExists(): Promise<void> {
  printSeparatorForSection("Checking if an index exists...");
  rl.question("Enter the index name: ", async (indexName: string) => {
    try {
      const result = await IndexExists(indexName);
      if (result) {
        printSuccessMessage(`Index '${indexName}' exists.`);
      } else {
        printErrorMessage(`Index '${indexName}' does not exist.`);
      }
    } catch (error: any) {
      printErrorMessage("An error occurred while checking the index:" + error.message);
    }
    displayMenu();
  });
}

async function handleCreateIndex(): Promise<void> {
  printSeparatorForSection("Creating an index...");
  rl.question("Enter the index definition filename: ", async (indexFileName: string) => {
    const filePath = path.resolve(__dirname, indexFileName); // Adjust the path to your file
    ReadJsonFile(filePath)
      .then(async (indexDefinition) => {
        try {
          const indexName = await CreateIndex(indexDefinition as SearchIndex);
          printSuccessMessage(`Index '${indexName}' created successfully.`);
        } catch (error: any) {
          printErrorMessage("An error occurred while creating the index:" + error.message);
        }
        displayMenu();
      })
      .catch((error) => {
        console.error("Failed to read JSON file:", error);
      });
  });
}

async function handleDeleteIndex(): Promise<void> {
  printSeparatorForSection("Deleting an index...");
  rl.question("Enter the index name: ", async (indexName: string) => {
    try {
      await DeleteIndex(indexName);
      printSuccessMessage(`Index '${indexName}' deleted successfully.`);
    } catch (error: any) {
      printErrorMessage("An error occurred while deleting the index:" + error.message);
    }
    displayMenu();
  });
}

// Function to handle user input
async function handleInput(option: string): Promise<void> {
  switch (option) {
    case "1":
      await handleCheckIndexExists();
      break;
    case "2":
      await handleCreateIndex();
      break;
    case "3":
      await handleDeleteIndex();
      break;
    case "4":
      console.log("Exiting...");
      rl.close();
      return;
    default:
      console.log("Invalid option. Please try again.");
      displayMenu();
  }
}

// Function to display the menu
function displayMenu(): void {
  console.log(`
*******************************
    Please select an option:
    1. Check if an index exists
    2. Create an index
    3. Delete an index
    4. Exit
  `);

  // Prompt the user to select an option
  rl.question("Select an option: ", async (option: string) => {
    await handleInput(option.trim());
  });
}

// Display the menu initially
displayMenu();
