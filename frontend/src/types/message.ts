export interface IMessage {
  _id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  modelType?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}