import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  modelType: string;
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.String, ref: 'Conversation', required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  modelType: { type: String },

});

export const Message = model<IMessage>('Message', messageSchema);
