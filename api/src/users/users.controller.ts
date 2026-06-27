import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { TelegramService } from '../telegram/telegram.service';

@Controller('users')
@UseGuards(JwtAuthGuard) // Yeh Guard ensure karta hai ki request mein valid JWT token ho
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}

  // Function: getMe (GET /api/users/me)
  // Kya kar raha hai: Current logged-in user ki details return karta hai.
  // Relation / Component: Frontend ke custom hook 'useAuth.ts' (hooks/useAuth.ts) mein 'getMe()' API function ke through fetch hota hai jisse DashboardPage aur Layout ko user ka data milta hai.
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  // Function: unlinkTelegram (DELETE /api/users/me/telegram)
  // Kya kar raha hai: Logged-in user ka Telegram Chat ID database se delete (unlink) karta hai.
  // Relation / Component: Frontend ke 'TelegramIntegration.tsx' component mein 'Unlink' button click karne par call hota hai.
  @Delete('me/telegram')
  unlinkTelegram(@Request() req) {
    return this.usersService.unlinkTelegram(req.user._id.toString());
  }

  // Function: findAll (GET /api/users)
  // Kya kar raha hai: Database se sabhi users (admins + normal users) fetch karta hai. Sirf Admin isko access kar sakta hai (AdminGuard).
  // Relation / Component: Frontend ke 'AllUsersPage.tsx' mein 'getAllUsers()' API function ke through fetch hota hai.
  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  // Function: findPending (GET /api/users/pending)
  // Kya kar raha hai: Sirf 'pending' status wale users fetch karta hai jinko abhi tak approval nahi mila.
  // Relation / Component: Frontend ke 'PendingUsersPage.tsx' mein 'getPendingUsers()' API function ke through fetch hota hai.
  @Get('pending')
  @UseGuards(AdminGuard)
  findPending() {
    return this.usersService.findAllPending();
  }

  // Function: findApproved (GET /api/users/approved)
  // Kya kar raha hai: Sirf 'approved' status wale users fetch karta hai.
  // Relation / Component: Frontend API client 'users.ts' mein getApprovedUsers function isko hit karta hai.
  @Get('approved')
  @UseGuards(AdminGuard)
  findApproved() {
    return this.usersService.findAllApproved();
  }

  // Function: approve (PATCH /api/users/:id/approve)
  // Kya kar raha hai: Specific user ka status 'approved' karta hai aur agar user ka Telegram link hai toh Telegram par congratulations message bhejta hai.
  // Relation / Component: Frontend ke 'PendingUsersPage.tsx' mein '✓ Approve' button click karne par call hota hai.
  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  async approve(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.approveUser(id, req.user._id.toString());
    if (user.telegramChatId) {
      await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
    }
    return user;
  }

  // Function: reject (PATCH /api/users/:id/reject)
  // Kya kar raha hai: Specific user ka status 'rejected' kar deta hai.
  // Relation / Component: Frontend ke 'PendingUsersPage.tsx' mein '✗ Reject' button click karne par call hota hai.
  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string) {
    return this.usersService.rejectUser(id);
  }

  // Function: update (PATCH /api/users/:id)
  // Kya kar raha hai: User ke details (jaise telegramChatId) update karta hai.
  // Relation / Component: Frontend ke 'TelegramIntegration.tsx' mein jab user apna Chat ID daalkar 'Save' button dabata hai, toh yeh endpoint call hota hai.
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}

