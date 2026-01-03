import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { runMCPAgent, closeMCP } from "./mcpService";

interface TelegramServiceConfig {
  token: string;
  prompt?: string;
}

interface ConversationContext {
  userId: number;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export class TelegramService {
  private bot: Telegraf<Context>;
  private conversations: Map<number, ConversationContext> = new Map();
  private systemPrompt: string;

  constructor(config: TelegramServiceConfig) {
    this.bot = new Telegraf(config.token);
    this.systemPrompt = config.prompt || "";
    this.setupHandlers();
  }


  private setupHandlers(): void {

    // Handle text messages
    this.bot.on(message("text"), async (ctx) => {
      const userMessage = ctx.message.text;
      const userId = ctx.from?.id;

      if (!userId) {
        await ctx.reply("No pude identificar tu usuario.");
        return;
      }

      try {
        // Show typing indicator
        await ctx.sendChatAction("typing");

        // Build prompt with conversation context

        console.log("Full Prompt:", userMessage);

        // Get response from MCP Agent with LLM
        const response = await runMCPAgent(userMessage);

        // Store assistant response in context


        // Send the response
        await ctx.reply(response);
      } catch (error) {
        console.error("Error processing message:", error);
        await ctx.reply(
          "Dame un momento por favor, estoy procesando tu solicitud."
        );
      }
    });

    // Handle other message types
    this.bot.on(message("photo"), async (ctx) => {
      await ctx.reply(
        "📸 Por favor envía solo mensajes de texto para más precisión."
      );
    });

    this.bot.on(message("video"), async (ctx) => {
      await ctx.reply(
        "🎥 Por favor envía solo mensajes de texto para más precisión."
      );
    });

    this.bot.on(message("document"), async (ctx) => {
      await ctx.reply(
        "📄 Por favor envía solo mensajes de texto para más precisión."
      );
    });

    // Error handler
    this.bot.catch((err, ctx) => {
      console.error("Telegraf error:", err);
      ctx.reply("Ocurrió un error. Por favor intenta de nuevo.").catch(
        console.error
      );
    });
  }

  /**
   * Launch the bot in polling mode (for local testing)
   */
  async launch(): Promise<void> {
    console.log("Starting Telegram Service Bot (polling mode)...");
    await this.bot.launch();
    console.log("✅ Bot is running!");

    // Enable graceful stop
    process.once("SIGINT", async () => {
      console.log("Stopping bot...");
      await closeMCP();
      await this.bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      console.log("Stopping bot...");
      await closeMCP();
      await this.bot.stop("SIGTERM");
      process.exit(0);
    });
  }

  /**
   * Launch the bot in webhook mode (for production)
   */
  async launchWebhook(webhookUrl: string, port: number = 3000): Promise<void> {
    console.log(
      `Starting Telegram Service Bot (webhook mode on port ${port})...`
    );
    await this.bot.launch({
      webhook: {
        domain: webhookUrl,
        port: port,
      },
    });
    console.log(`✅ Bot is running on ${webhookUrl}`);

    process.once("SIGINT", async () => {
      console.log("Stopping bot...");
      await closeMCP();
      await this.bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      console.log("Stopping bot...");
      await closeMCP();
      await this.bot.stop("SIGTERM");
      process.exit(0);
    });
  }

  /**
   * Stop the bot and close MCP connections
   */
  async stop(): Promise<void> {
    await closeMCP();
    await this.bot.stop();
    console.log("❌ Bot stopped");
  }

  /**
   * Get the underlying Telegraf instance for advanced usage
   */
  getBot(): Telegraf<Context> {
    return this.bot;
  }

  /**
   * Clear conversation history for a user
   */
  clearUserConversation(userId: number): void {
    this.conversations.delete(userId);
  }

}
