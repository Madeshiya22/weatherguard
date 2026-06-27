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

  // Function: onModuleInit
  // Kya kar raha hai: NestJS server start hote hi yeh function call hota hai aur 
  // node-cron ke through har 6 ghante ('0 */6 * * *') par processWeatherAlert() run karne ka timer set kar deta hai.
  // Relation / Component: Yeh backend ka automated background scheduler hai jisko frontend ki kisi request ki zarurat nahi hoti.
  onModuleInit() {
    cron.schedule('0 */6 * * *', async () => {
      this.logger.log('Cron: executing scheduled weather alert');
      await this.processWeatherAlert();
    });
    this.logger.log('Weather alert cron scheduled (every 6 hours)');
  }

  // Function: processWeatherAlert
  // Kya kar raha hai: Core business logic function! Yeh WeatherService se live weather fetch karta hai, UsersService se approved+Telegram linked users nikaalta hai, TelegramService se sabhi ko alert broadcast karta hai, aur AlertModel ke through DB mein log save karta hai.
  // Relation / Component: Yeh cron schedule se auto-run hota hai aur AlertsController.triggerManual() (Frontend AlertsPage.tsx ke 'Trigger Manual Alert' button) se bhi run hota hai.
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

  // Function: triggerManualAlert
  // Kya kar raha hai: processWeatherAlert() ko manually execute karta hai.
  // Relation / Component: AlertsController.triggerManual() ke through Frontend ke 'AlertsPage.tsx' se trigger hota hai.
  async triggerManualAlert(): Promise<{ queued: boolean; success: boolean }> {
    await this.processWeatherAlert();
    return { queued: true, success: true };
  }

  // Function: getRecentAlerts
  // Kya kar raha hai: DB se purane alert logs ko sort karke return karta hai.
  // Relation / Component: AlertsController.getRecent() ke through Frontend ke 'AlertsPage.tsx' par list display hoti hai.
  async getRecentAlerts(limit = 20): Promise<AlertDocument[]> {
    return this.alertModel.find().sort({ createdAt: -1 }).limit(limit);
  }
}

