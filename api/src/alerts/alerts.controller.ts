import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getRecent(@Query('limit') limit?: string) {
    return this.alertsService.getRecentAlerts(limit ? parseInt(limit) : 20);
  }

  @Post('trigger')
  triggerManual() {
    return this.alertsService.triggerManualAlert();
  }
}
