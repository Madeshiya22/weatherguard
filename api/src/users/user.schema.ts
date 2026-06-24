import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatar: string;

  @Prop({ required: true, enum: OAuthProvider })
  provider: OAuthProvider;

  @Prop({ required: true })
  providerId: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop()
  telegramChatId: string;

  @Prop()
  telegramUsername: string;

  @Prop()
  approvedAt: Date;

  @Prop()
  approvedBy: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
