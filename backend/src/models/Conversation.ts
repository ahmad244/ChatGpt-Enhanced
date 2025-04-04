import { Schema, model, Document } from 'mongoose';

interface IConversation extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }
});

export const Conversation = model<IConversation>('Conversation', conversationSchema);
