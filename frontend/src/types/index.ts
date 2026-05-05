export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Sender {
  _id: string;
  role: 'user' | 'assistant' | 'system';
}

export interface Message {
  _id: string;
  content: string;
  sender: Sender;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  participants: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationState {
  loading: boolean;
  error: string | null;
  data: Conversation | null;
}

export interface UserState {
  _id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export interface RootState {
  user: UserState;
  conversation: ConversationState;
}

// Voice chat related types
export interface VoiceResponseData {
  success: boolean;
  transcribedText: string;
  responseText: string;
  audioResponse: string;
  conversationId: string;
}

export interface VoiceErrorData {
  message: string;
  error: string;
}

// Realtime chat types
export interface RealtimeChatMessage {
  _id: string;
  content: string;
  sender: Sender;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

export interface ChatTypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

// Redux action types
export enum ActionTypes {
  FETCH_CONVERSATION = 'FETCH_CONVERSATION',
  SEND_MESSAGE = 'SEND_MESSAGE',
}

export interface Action {
  type: string;
  payload?: any;
}