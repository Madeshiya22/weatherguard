import { Controller, Get, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('status')
  getStatus() {
    return this.telegramService.getStatus();
  }

  @Post('test')
  async testTelegram(@Body('chatId') chatId: string) {
    return this.telegramService.sendTestMessage(chatId);
  }
}
