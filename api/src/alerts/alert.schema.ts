import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 0 })
  recipientCount: number;

  @Prop()
  triggeredAt: Date;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
