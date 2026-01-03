import { TelegramService } from "./services/telegramService";
import { newChatResponsePromt } from "./promts";

const startTelegramBot = async () => {
  try {
    const token = Bun.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN environment variable is not set. Please set it before running the bot."
      );
    }

    console.log("🚀 Initializing Telegram Service Bot...");

    const telegramService = new TelegramService({
      token,
      prompt: newChatResponsePromt,
    });

    await telegramService.launch();

    console.log("📱 Telegram bot is ready to receive messages!");
    console.log(
      "Send messages to your bot on Telegram to test the AI-powered responses."
    );
  } catch (err) {
    console.error(
      "❌ Error starting Telegram bot:",
      (err as Error).message
    );
    process.exit(1);
  }
};

startTelegramBot();
