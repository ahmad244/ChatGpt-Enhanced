import { Schema, model, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  title: string;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true },
  title: { type: String, required: false, default: 'New Conversation' }, // Default title
  updatedAt: { type: Date, default: Date.now }, // Add updatedAt field
});

// Update the updatedAt field on save
conversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Conversation = model<IConversation>('Conversation', conversationSchema);
