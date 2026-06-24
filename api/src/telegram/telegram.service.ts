import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;

  constructor(private config: ConfigService) {}

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

  getStatus() {
    const isRunning = !!this.bot;
    return {
      success: true,
      botRunning: isRunning,
      message: 'Telegram bot is running successfully',
    };
  }

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

  async broadcastToMany(chatIds: string[], message: string): Promise<void> {
    this.logger.log(`Broadcasting to ${chatIds.length} users`);
    await Promise.allSettled(chatIds.map((id) => this.sendMessage(id, message)));
  }
}
