import { Controller, Get, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

// Function: TelegramController
// Kya kar raha hai: Telegram bot ki status check karne aur test messages bhejane ke REST API endpoints provide karta hai.
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  // Function: getStatus (GET /api/telegram/status)
  // Kya kar raha hai: Check karta hai ki Telegraf bot instance running state mein hai ya nahi.
  // Relation / Component: Frontend ke 'TelegramIntegration.tsx' (components/TelegramIntegration.tsx) mein check hota hai taaki UI par bot status (Connected / Running) dikhaya ja sake.
  @Get('status')
  getStatus() {
    return this.telegramService.getStatus();
  }

  // Function: testTelegram (POST /api/telegram/test)
  // Kya kar raha hai: Specific Chat ID par ek test message bhejta hai taaki user verify kar sake ki unka Telegram bot thik se link ho chuka hai.
  // Relation / Component: Frontend ke 'TelegramIntegration.tsx' mein 'Test Connection' / 'Save' button ke waqt call hota hai verify karne ke liye.
  @Post('test')
  async testTelegram(@Body('chatId') chatId: string) {
    return this.telegramService.sendTestMessage(chatId);
  }
}
