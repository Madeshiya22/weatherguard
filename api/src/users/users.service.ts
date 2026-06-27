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

  // Function: findOrCreate
  // Kya kar raha hai: OAuth login ke waqt check karta hai ki user pehle se DB mein hai ya nahi. Agar naya user hai, toh check karta hai ki kya uska email .env ke ADMIN_EMAIL se match karta hai. Agar haan, toh use 'admin' role aur 'approved' status deta hai, warna 'user' role aur 'pending' status deta hai.
  // Relation / Component: Backend ke GoogleStrategy aur GithubStrategy (auth/strategies) se call hota hai jab user login karta hai.
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

  // Function: findById
  // Kya kar raha hai: DB se User ID ke base par user document nikaalta hai.
  // Relation / Component: JwtStrategy (auth/strategies/jwt.strategy.ts) har protected request par user ko verify karne ke liye isko call karta hai.
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Function: findByEmail
  // Kya kar raha hai: Email ke base par user search karta hai.
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  // Function: findAllPending
  // Kya kar raha hai: 'pending' status wale users ko DB se sort karke fetch karta hai.
  // Relation / Component: UsersController.findPending() ke through Frontend ke 'PendingUsersPage.tsx' par list display hoti hai.
  async findAllPending(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.PENDING }).sort({ createdAt: -1 });
  }

  // Function: findAllApproved
  // Kya kar raha hai: 'approved' status wale users ko fetch karta hai.
  async findAllApproved(): Promise<UserDocument[]> {
    return this.userModel.find({ status: UserStatus.APPROVED }).sort({ createdAt: -1 });
  }

  // Function: findAll
  // Kya kar raha hai: DB ke saare users fetch karta hai.
  // Relation / Component: UsersController.findAll() ke through Frontend ke 'AllUsersPage.tsx' par list display hoti hai.
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 });
  }

  // Function: approveUser
  // Kya kar raha hai: User ka status 'approved' karke approval timestamp aur adminId save karta hai.
  // Relation / Component: UsersController.approve() ke through Frontend ke 'PendingUsersPage.tsx' mein 'Approve' button dabane par execute hota hai.
  async approveUser(userId: string, adminId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.status = UserStatus.APPROVED;
    user.approvedAt = new Date();
    user.approvedBy = adminId;
    return user.save();
  }

  // Function: rejectUser
  // Kya kar raha hai: User ka status 'rejected' kar deta hai.
  // Relation / Component: UsersController.reject() ke through Frontend ke 'PendingUsersPage.tsx' mein 'Reject' button dabane par execute hota hai.
  async rejectUser(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.status = UserStatus.REJECTED;
    return user.save();
  }

  // Function: update
  // Kya kar raha hai: Telegram chat ID ki numeric regex validation karta hai aur DB mein user update karta hai.
  // Relation / Component: UsersController.update() ke through Frontend ke 'TelegramIntegration.tsx' mein 'Save' button dabane par call hota hai.
  async update(userId: string, dto: UpdateUserDto): Promise<UserDocument> {
    if (dto.telegramChatId !== undefined && !/^\d+$/.test(dto.telegramChatId)) {
      throw new BadRequestException('Invalid Telegram Chat ID');
    }
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Function: unlinkTelegram
  // Kya kar raha hai: Database se user ka telegramChatId field remove ($unset) kar deta hai.
  // Relation / Component: UsersController.unlinkTelegram() ke through Frontend ke 'TelegramIntegration.tsx' mein 'Unlink' button dabane par call hota hai.
  async unlinkTelegram(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $unset: { telegramChatId: 1 } },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Function: findApprovedWithTelegram
  // Kya kar raha hai: Sirf un users ko nikaalta hai jinka status 'approved' hai aur unka telegramChatId DB mein exist karta hai.
  // Relation / Component: AlertsService.processWeatherAlert() isko call karta hai taaki sirf verified aur linked users ko hi Telegram weather alerts bheje jayein.
  async findApprovedWithTelegram(): Promise<UserDocument[]> {
    return this.userModel.find({
      status: UserStatus.APPROVED,
      telegramChatId: { $exists: true, $ne: null },
    });
  }
}

