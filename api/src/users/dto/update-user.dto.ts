import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { UserStatus } from '../user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Invalid Telegram Chat ID' })
  telegramChatId?: string;

  @IsOptional()
  @IsString()
  telegramUsername?: string;
}
