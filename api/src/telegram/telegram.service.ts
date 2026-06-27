import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

// Function: TelegramService
// Kya kar raha hai: Telegraf library ka use karke Telegram bot ko initialize, manage, aur messages 
// broadcast karne ka main service hai.
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(private config: ConfigService) {}

  // Function: onModuleInit
  // Kya kar raha hai: Jaise hi NestJS server start hota hai, yeh .env se 'TELEGRAM_BOT_TOKEN'
  //  nikaalta hai. Agar token mil jata hai toh bot ko Telegraf ke through launch kar deta hai aur long-polling shuru karta hai.
  // Relation / Backend: NestJS lifecycle hook hai jo auto-run hota hai server startup par.
  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — bot disabled');
      return;
    }

    this.bot = new Telegraf(token);
    this.registerCommands();
    this.bot.launch().catch((err) => this.logger.error('Bot launch failed', err));
    this.logger.log('Telegram bot started successfully');
  }

  // Function: registerCommands
  // Kya kar raha hai: Telegram app ke andar jab user bot ko '/start' ya '/status' message bhejta hai,
  //  toh un commands ko listen karke unko unka 'Chat ID' aur welcome message bhejta hai.
  // Relation / User Flow: User Telegram app par /start karta hai taaki use Chat ID mil sake, jisko woh
  //  frontend ke 'TelegramIntegration.tsx' mein paste karta hai.
  private registerCommands() {
    this.bot.start(async (ctx) => {
      const chatId = String(ctx.chat.id);
      await ctx.reply(
        `👋 Welcome to *WeatherGuard*!\n\nYour Chat ID is: \`${chatId}\`\n\nPaste this ID in the WeatherGuard web app to link your account and receive weather alerts.`,
        { parse_mode: 'Markdown' },
      );
    });

    this.bot.command('status', async (ctx) => {
      await ctx.reply('Visit the WeatherGuard dashboard to check your account status.');
    });
  }

  // Function: getStatus
  // Kya kar raha hai: Check karta hai ki Telegraf bot active hai ya nahi aur status return karta hai.
  // Relation / Component: TelegramController.getStatus() ke through Frontend 'TelegramIntegration.tsx' 
  // mein dikhata hai.
  getStatus() {
    const isRunning = !!this.bot;
    return {
      success: true,
      botRunning: isRunning,
      message: 'Telegram bot is running successfully',
    };
  }

  // Function: sendTestMessage
  // Kya kar raha hai: Specific Chat ID par test message bhej kar confirm karta hai ki connection thik hai.
  // Relation / Component: TelegramController.testTelegram() ke through Frontend 'TelegramIntegration.tsx' se trigger hota hai.
  async sendTestMessage(chatId: string) {
    if (!this.bot) {
      this.logger.error('Failed to send message');
      return {
        success: false,
        message: 'Failed to send Telegram message',
      };
    }
    try {
      const message = '✅ WeatherGuard Test Message\n\nTelegram integration is working successfully.';
      await this.bot.telegram.sendMessage(chatId, message);
      this.logger.log(`Test message sent to chatId: ${chatId}`);
      return {
        success: true,
        message: 'Test message sent successfully',
      };
    } catch (err) {
      this.logger.error('Failed to send message');
      return {
        success: false,
        message: 'Failed to send Telegram message',
      };
    }
  }

  // Function: sendMessage
  // Kya kar raha hai: Telegraf bot ke zariye kisi bhi ek user ko markdown formatted text bhejta hai.
  //  Error aane par server crash nahi hone deta balki log mein capture karta hai.
  async sendMessage(chatId: string, message: string): Promise<void> {
    if (!this.bot) {
      this.logger.warn('Bot not initialized, skipping message to ' + chatId);
      return;
    }
    try {
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.error(`Failed to send to chatId ${chatId}: ${err.message}`);
    }
  }

  // Function: sendApprovalNotification
  // Kya kar raha hai: User ko admin dwara approve kiye jaane par 'Congratulations' message bhejta hai.
  // Relation / Backend: UsersController.approve() (Frontend PendingUsersPage.tsx ke 'Approve' button)
  //  se trigger hota hai.
  async sendApprovalNotification(chatId: string, userName: string): Promise<void> {
    const message = [
      `🎉 *Congratulations, ${userName}!*`,
      '',
      'Your WeatherGuard account has been *approved* by the admin.',
      '',
      'You will now receive automated weather alerts.',
    ].join('\n');
    await this.sendMessage(chatId, message);
  }

  // Function: broadcastToMany
  // Kya kar raha hai: Ek sath kayi saare users ko weather alert bhejta hai. 'Promise.allSettled' ka use
  //  karta hai taaki agar ek user ne bot ko block kar diya ho, tab bhi baaki sabhi users ko alert seamlessly milta rahe.
  // Relation / Backend: AlertsService.processWeatherAlert() isko call karta hai cron job aur manual 
  // trigger par.
  async broadcastToMany(chatIds: string[], message: string): Promise<void> {
    this.logger.log(`Broadcasting to ${chatIds.length} users`);
    await Promise.allSettled(chatIds.map((id) => this.sendMessage(id, message)));
  }
}
