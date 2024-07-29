import * as readline from 'readline';

// Create readline interface instance for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const promptUser = (): void => {
  rl.question('Enter input ("quit" to exit): ', (answer) => {
    if (answer.toLowerCase() === 'quit') {
      rl.close();
      return;
    }
    console.log(`You entered: ${answer}`);
    promptUser(); // Prompt again
  });
};

// Start the prompt
promptUser();

// Handle readline close event
rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
