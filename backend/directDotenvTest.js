// Import the dotenv package
import dotenv from 'dotenv';

// Load the .env file contents
const result = dotenv.config({ path: '../.env' });


if (result.error) {
  throw result.error;
}

console.log(process.env.PORT);
console.log(process.env.COLOR_TEST_VAR);
