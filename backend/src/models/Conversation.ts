import { Schema, model, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  title: string;
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true },
  title: { type: String, required: false, default: 'New Conversation' }, // Default title
});

export const Conversation = model<IConversation>('Conversation', conversationSchema);
