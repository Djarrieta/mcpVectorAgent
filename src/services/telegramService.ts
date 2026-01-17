import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { runMCPAgent, closeMCP } from "./mcpService";
import { ChatHistorySQLite } from "./chatHistorySQLite";
import { getFinalAnswer, getStructuredOutput } from "./structuredOutputService";
import { OrdersSQLite } from "./OrdersSQLite";
import { newChatResponsePromt } from "../promts";

interface TelegramServiceConfig {
  token: string;
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
  private chatHistoryService: ChatHistorySQLite;
  private ordersService: OrdersSQLite;
  private lastUserUpdates = new Map<number, number>();

  constructor(config: TelegramServiceConfig) {
    this.bot = new Telegraf(config.token);
    this.chatHistoryService = new ChatHistorySQLite();
    this.ordersService = new OrdersSQLite()
    this.setupHandlers();
  }

  private setupHandlers(): void {

    // Handle text messages
    this.bot.on(message("text"), async (ctx) => {
      const userId = ctx.from?.id;
      if (!userId) {
        await ctx.reply("No pude identificar tu usuario.");
        return;
      }

      const timestamp = Date.now();
      this.lastUserUpdates.set(userId, timestamp);

      // Fire and forget - do not await
      this.handleUserMessage(ctx, userId, ctx.message.text, timestamp).catch(err => {
        console.error("Error in background message handler:", err);
      });
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
      this.chatHistoryService.close();
      await closeMCP();
      await this.bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      console.log("Stopping bot...");
      this.chatHistoryService.close();
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
      this.chatHistoryService.close();
      await closeMCP();
      await this.bot.stop("SIGINT");
      process.exit(0);
    });
    process.once("SIGTERM", async () => {
      console.log("Stopping bot...");
      this.chatHistoryService.close();
      await closeMCP();
      await this.bot.stop("SIGTERM");
      process.exit(0);
    });
  }

  /**
   * Stop the bot and close MCP connections
   */
  async stop(): Promise<void> {
    this.chatHistoryService.close();
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

  private async handleUserMessage(ctx: any, userId: number, userMessage: string, timestamp: number) {
    try {
      console.log("Processing message at:", timestamp);

      // Show typing indicator
      await ctx.sendChatAction("typing");

      const order = this.ordersService.getOrCreateByUserId(userId.toString(), { requiresHumanIntervention: false })
      // Store user messages in chat history
      this.chatHistoryService.addMessage(userId.toString(), "user", userMessage, timestamp);

      if (order.requiresHumanIntervention) {
        return
      }

      // Build conversation context
      const chatResponsePromt = newChatResponsePromt(this.chatHistoryService.getByUserAsText(userId.toString()), this.ordersService.text(order));

      // Get chatResponse from MCP Agent with LLM
      let chatResponse = await runMCPAgent(chatResponsePromt);
      chatResponse = await getFinalAnswer(chatResponse);

      const formattedResponse = await getStructuredOutput(
        this.chatHistoryService.getByUserAsText(userId.toString()),
        this.ordersService.text(order)
      );

      // Check if this is still the latest message for this user
      const latestTimestamp = this.lastUserUpdates.get(userId);
      if (latestTimestamp && latestTimestamp !== timestamp) {
        console.log(`Message from ${timestamp} ignored because a newer message (${latestTimestamp}) exists.`);
        return;
      }

      // Send the chatResponse
      await ctx.reply(chatResponse);

      // Store assistant chatResponse in chat history
      this.chatHistoryService.addMessage(userId.toString(), "assistant", chatResponse, Date.now());

      this.ordersService.updateOrder(order.id, formattedResponse);
      console.log("Updated order:", order);
    } catch (error) {
      console.error("Error processing message:", error);
      // Only reply with error if it's the latest message (optional, but good UX)
      if (this.lastUserUpdates.get(userId) === timestamp) {
        await ctx.reply(
          "Dame un momento por favor, estoy procesando tu solicitud."
        );
      }
    }
  }

}
