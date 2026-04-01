import { add } from './utils.js';

/**
 * Main application class
 */
export class App {
  /**
   * Run the application
   */
  run() {
    const result = add(1, 2);
    console.log(`Result: ${result}`);
  }
}

const app = new App();
app.run();
