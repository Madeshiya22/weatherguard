import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import { Alert, AlertDocument } from './alert.schema';
import { WeatherService } from '../weather/weather.service';
import { TelegramService } from '../telegram/telegram.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AlertsService implements OnModuleInit {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private weatherService: WeatherService,
    private telegramService: TelegramService,
    private usersService: UsersService,
  ) {}

  onModuleInit() {
    cron.schedule('0 */6 * * *', async () => {
      this.logger.log('Cron: executing scheduled weather alert');
      await this.processWeatherAlert();
    });
    this.logger.log('Weather alert cron scheduled (every 6 hours)');
  }

  async processWeatherAlert(): Promise<void> {
    this.logger.log('Processing weather alert job');
    try {
      const weather = await this.weatherService.getCurrentWeather();
      const message = this.weatherService.formatMessage(weather);

      const approvedUsers = await this.usersService.findApprovedWithTelegram();
      const chatIds = approvedUsers.map((u) => u.telegramChatId);

      await this.telegramService.broadcastToMany(chatIds, message);

      await this.alertModel.create({
        city: weather.city,
        message,
        temperature: weather.temperature,
        description: weather.description,
        recipientCount: approvedUsers.length,
        triggeredAt: new Date(),
      });

      this.logger.log(`Alert sent to ${approvedUsers.length} users`);
    } catch (err) {
      this.logger.error('Alert job failed', err.message);
      throw err;
    }
  }

  async triggerManualAlert(): Promise<{ queued: boolean; success: boolean }> {
    await this.processWeatherAlert();
    return { queued: true, success: true };
  }

  async getRecentAlerts(limit = 20): Promise<AlertDocument[]> {
    return this.alertModel.find().sort({ createdAt: -1 }).limit(limit);
  }
}
