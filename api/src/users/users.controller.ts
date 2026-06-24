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
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Delete('me/telegram')
  unlinkTelegram(@Request() req) {
    return this.usersService.unlinkTelegram(req.user._id.toString());
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('pending')
  @UseGuards(AdminGuard)
  findPending() {
    return this.usersService.findAllPending();
  }

  @Get('approved')
  @UseGuards(AdminGuard)
  findApproved() {
    return this.usersService.findAllApproved();
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  async approve(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.approveUser(id, req.user._id.toString());
    if (user.telegramChatId) {
      await this.telegramService.sendApprovalNotification(user.telegramChatId, user.name);
    }
    return user;
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string) {
    return this.usersService.rejectUser(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
