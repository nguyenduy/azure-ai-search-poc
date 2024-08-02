import readline from "readline";
import dotenv from "dotenv";
import { CreateIndex, DeleteIndex, IndexExists, ListIndexes, LoadBulkSampleDataToIndex, SearchByAgeRanges, SearchByTimeFrames } from "./azure-ai-search-service"; // Ensure this is the correct path and file name
import path from "path";
import { ReadJsonFile } from "./helpers";
import { SearchIndex } from "@azure/search-documents";
import chalk from "chalk";

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
  console.log(chalk.blue(title));
};

const printSuccessMessage = (message: string) => {
  console.log(chalk.green(message));
};

const printErrorMessage = (message: string) => {
  console.log(chalk.red(message));
};

// list all indexes
async function handleListAllIndexes(): Promise<void> {
  try {
    const indexNames = await ListIndexes();
    if (indexNames.length > 0) {
      console.log(indexNames.length + " index(es) found: ");
      indexNames.forEach((indexName) => {
        printSuccessMessage(`* ${indexName}`);
      });
    } else {
      printSuccessMessage("No indexes found.");
    }
  } catch (error: any) {
    printErrorMessage("An error occurred while listing the indexes: " + error.message);
  }
  displayMenu();
}

// check if index exists
async function handleCheckIndexExists(): Promise<void> {
  rl.question("Enter the index name: ", async (indexName: string) => {
    try {
      const result = await IndexExists(indexName);
      if (result) {
        printSuccessMessage(`Index '${indexName}' exists.`);
      } else {
        printErrorMessage(`Index '${indexName}' does not exist.`);
      }
    } catch (error: any) {
      printErrorMessage("An error occurred while checking the index: " + error.message);
    }
    displayMenu();
  });
}

async function handleCreateIndex(): Promise<void> {
  rl.question("Enter the index definition filename: ", async (indexFileName: string) => {
    const filePath = path.resolve(__dirname, indexFileName); // Adjust the path to your file

    ReadJsonFile(filePath)
      .then(async (indexDefinition: SearchIndex) => {
        try {
          await CreateIndex(indexDefinition);
          printSuccessMessage(`Index '${indexDefinition.name}' created successfully.`);
        } catch (error: any) {
          printErrorMessage("An error occurred while creating the index: " + error.message);
        }
        displayMenu();
      })
      .catch((error) => {
        printErrorMessage("Failed to read JSON file: " + error.message);
        displayMenu();
      });
  });
}

async function handleDeleteIndex(): Promise<void> {
  rl.question("Enter the index name: ", async (indexName: string) => {
    try {
      await DeleteIndex(indexName);
      printSuccessMessage(`Index '${indexName}' deleted successfully.`);
    } catch (error: any) {
      printErrorMessage("An error occurred while deleting the index: " + error.message);
    }
    displayMenu();
  });
}

async function loadSampleDataIntoIndex(): Promise<void> {
  rl.question("Enter sample data filename: ", async (filename: string) => {
    rl.question("Enter the index name: ", async (indexName: string) => {
      ReadJsonFile(path.resolve(__dirname, filename))
        .then(async (data: any) => {
          // Load sample data into the index
          try {
            await LoadBulkSampleDataToIndex(data, indexName);
            printSuccessMessage(`Sample data loaded into index '${indexName}' successfully.`);
          } catch (error: any) {
            printErrorMessage("An error occurred while loading sample data: " + error.message);
          }
          displayMenu();
        })
        .catch((error) => {
          printErrorMessage("Failed to read JSON file: " + error.message);
          displayMenu();
        });
    });
  });
}

function exitProgram(): void {
  console.log("Exiting...");
  rl.close();
  process.exit(0);
}

// age ranges based on date of birth
function handleQueryForAgeRanges(): void {
  rl.question("Enter index name: ", async (indexName: string) => {
    rl.question("Enter the ages (comma-separated; ex: 18-25,35-45) to query: ", async (ranges: string) => {
      try {
        await SearchByAgeRanges(indexName, ranges);
        displayMenu();
      } catch (error: any) {
        printErrorMessage("An error occurred while querying age ranges: " + error.message);
        displayMenu();
      }
    });
  });
}

function handleQueryForTimeFrames(): void {
  rl.question("Enter index name: ", async (indexName: string) => {
    rl.question("Enter the time frames (comma-separated; default: today,lastWeek,lastMonth,lastYear) to query: ", async (ranges: string) => {
      try {
        await SearchByTimeFrames(indexName, ranges);
        displayMenu();
      } catch (error: any) {
        printErrorMessage("An error occurred while querying age ranges: " + error.message);
        displayMenu();
      }
    });
  });
}

const menuOptions = [
  { option: "1", text: "List all indexes", handler: handleListAllIndexes },
  { option: "2", text: "Check if an index exists", handler: handleCheckIndexExists },
  { option: "3", text: "Delete an index", handler: handleDeleteIndex },
  { option: "4", text: "Create an index", handler: handleCreateIndex },
  { option: "5", text: "Load/Update sample data into index", handler: loadSampleDataIntoIndex },
  { option: "6", text: "Exit", handler: exitProgram },

  /* these are for exploring ability to make query for date ranges */
  // age ranges based on date of birth
  { option: "7", text: "Query for age ranges based on date of birth", handler: handleQueryForAgeRanges },
  // time frames based on createdAt (such as today, yesterday, lastWeek, lastMonth, lastYear)
  { option: "8", text: "Query for time frames based on createdAt", handler: handleQueryForTimeFrames },
];

async function handleInput(option: string): Promise<void> {
  const selectedOption = menuOptions.find((opt) => opt.option === option);
  if (selectedOption) {
    printSeparatorForSection(selectedOption.text);
    await selectedOption.handler();
  } else {
    console.log("Invalid option. Please try again.");
    displayMenu();
  }
}

function displayMenu(): void {
  console.log(`
*******************************
    Please select an option:
  ${menuOptions.map((opt) => `${opt.option}. ${opt.text}`).join("\n  ")}
  `);

  // Prompt the user to select an option
  rl.question("Select an option: ", async (option: string) => {
    await handleInput(option.trim());
  });
}

// Display the menu initially
displayMenu();
