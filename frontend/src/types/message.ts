export interface IMessage {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelType?: string;
}
