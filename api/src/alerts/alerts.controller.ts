import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard, AdminGuard) // Ensure karta hai ki sirf logged-in Admin hi alerts dekh/trigger kar sake
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // Function: getRecent (GET /api/alerts)
  // Kya kar raha hai: Database se pichle 20 sent weather alerts fetch karta hai.
  // Relation / Component: Frontend ke 'AlertsPage.tsx' mein 'getAlerts()' API call ke through fetch hota hai jisse alerts table display hoti hai.
  @Get()
  getRecent(@Query('limit') limit?: string) {
    return this.alertsService.getRecentAlerts(limit ? parseInt(limit) : 20);
  }

  // Function: triggerManual (POST /api/alerts/trigger)
  // Kya kar raha hai: Admin dwara manual weather alert broadcast trigger karta hai.
  // Relation / Component: Frontend ke 'AlertsPage.tsx' mein '🚀 Trigger Manual Alert' button click karne par call hota hai.
  @Post('trigger')
  triggerManual() {
    return this.alertsService.triggerManualAlert();
  }
}

