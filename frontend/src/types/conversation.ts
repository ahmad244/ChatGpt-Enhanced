export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy interface for backward compatibility
export interface IConversation {
  _id: string;
  title: string;
  messages: Message[];
  model?: string;
  createdAt: string;
  updatedAt: string;
}