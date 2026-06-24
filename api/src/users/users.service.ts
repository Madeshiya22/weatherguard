import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus, OAuthProvider, UserRole } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

export interface CreateUserDto {
  name: string;
  email: string;
  avatar?: string;
  provider: OAuthProvider;
  providerId: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreate(dto: CreateUserDto): Promise<UserDocument> {
    let existing = await this.userModel.findOne({
      provider: dto.provider,
      providerId: dto.providerId,
    });
    if (existing) return existing;

    existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      existing.provider = dto.provider;
      existing.providerId = dto.providerId;
      return existing.save();
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const role = dto.email === adminEmail ? UserRole.ADMIN : UserRole.USER;
    const status = role === UserRole.ADMIN ? UserStatus.APPROVED : UserStatus.PENDING;

    return this.userModel.create({ ...dto, role, status });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findAllPending(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.PENDING }).sort({ createdAt: -1 });
  }

  async findAllApproved(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.APPROVED }).sort({ createdAt: -1 });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 });
  }

  async approveUser(userId: string, adminId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.status = UserStatus.APPROVED;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    return user.save();
  }

  async rejectUser(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.status = UserStatus.REJECTED;
    return user.save();
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (dto.telegramChatId !== undefined && !/^\d+$/.test(dto.telegramChatId)) {
      throw new BadRequestException('Invalid Telegram Chat ID');
    }
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async unlinkTelegram(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { telegramChatId: 1 } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findApprovedWithTelegram(): Promise<UserDocument[]> {
    return this.userModel.find({
      status: UserStatus.APPROVED,
      telegramChatId: { $exists: true, $ne: null },
    });
  }
}
