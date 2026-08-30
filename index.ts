import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { app } from "./src/graph.js";

process.on("unhandledRejection", (reason: unknown) => {
  console.error("\n❌ Unhandled Rejection:", reason);
});

const main = async () => {
  const rl = readline.createInterface({
    input,
    output,
  });

  console.log(`
 AI Agent
   Type "exit" to quit.
`);

  let currentMessages: any[] = [];

  while (true) {
    const userInput = await rl.question("You ❯ ");

    if (userInput.trim().toLowerCase() === "exit") {
      break;
    }

    if (!userInput.trim()) {
      continue;
    }

    currentMessages.push({
      role: "user",
      content: userInput,
    });

    try {
      // Stop accepting user input while the agent is working
      rl.pause();

      process.stdout.write("\n Agent ❯ ");

      const stream = await app.stream(
        {
          messages: currentMessages,
        },
        {
          streamMode: "messages",
        }
      );

      let assistantText = "";

      for await (const [message, metadata] of stream) {
        if (
          metadata?.langgraph_node === "agent" &&
          message.content
        ) {
          const content = String(message.content);

          process.stdout.write(content);
          assistantText += content;
        }
      }

      currentMessages.push({
        role: "assistant",
        content: assistantText,
      });

      process.stdout.write("\n\n");

    } catch (error) {
      console.error("\n❌ Error:");

      if (error instanceof Error) {
        console.error(error.message);
      }

      process.stdout.write("\n");

    } finally {
      // Allow input again after the response is finished
      rl.resume();
    }
  }

  rl.close();

  console.log("Goodbye!");
};

main();