import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

// Function: TelegramModule
// Kya kar raha hai: Telegram bot aur API integration se juddi sabhi chizon ko ek module mein bundle karta hai.
@Module({
  // controllers: /api/telegram ke endpoints (status, test) ko handle karne ke liye TelegramController ko register karta hai.
  controllers: [TelegramController],
  
  // providers: TelegramService ko instantiate karta hai taaki Controller iske functions use kar sake.
  providers: [TelegramService],
  
  // exports: TelegramService ko export karta hai taaki doosre modules (jaise UsersModule approval ke waqt aur AlertsModule weather broadcast ke waqt) is service ke functions (sendApprovalNotification, broadcastToMany) ko use kar sakein.
  exports: [TelegramService],
})
export class TelegramModule {}
