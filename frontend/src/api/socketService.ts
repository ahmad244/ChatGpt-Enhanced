import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { RealtimeChatMessage, ChatTypingIndicator } from '../types';

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private connected: boolean = false;
  private messageHandlers: ((message: RealtimeChatMessage) => void)[] = [];
  private typingHandlers: ((data: ChatTypingIndicator) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      this.socket = io(apiUrl, {
        auth: {
          token: localStorage.getItem('token')
        },
        autoConnect: false
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
      this.connectHandlers.forEach(handler => handler());
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
      this.disconnectHandlers.forEach(handler => handler());
    });

    this.socket.on('new_message', (message: RealtimeChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('typing', (data: ChatTypingIndicator) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      
      // If token is invalid, try to reconnect with a new token
      if (error.message.includes('authentication error')) {
        const newToken = localStorage.getItem('token');
        if (newToken && this.socket) {
          // Update the auth token
          if (this.socket.io?.opts) {
            this.socket.io.opts.auth = { token: newToken };
          }
          // Try to reconnect after a short delay
          setTimeout(() => this.socket?.connect(), 1000);
        }
      }
    });
  }

  public connect(): void {
    if (this.socket && !this.connected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket && this.connected) {
      this.socket.disconnect();
    }
  }

  public joinConversation(conversationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  public leaveConversation(conversationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  public sendMessage(message: Omit<RealtimeChatMessage, '_id'>): string {
    if (this.socket && this.connected) {
      const tempId = Date.now().toString(); // Generate temporary ID
      this.socket.emit('send_message', { ...message, _id: tempId });
      return tempId;
    }
    return '';
  }

  public sendTypingIndicator(data: ChatTypingIndicator): void {
    if (this.socket && this.connected) {
      this.socket.emit('typing', data);
    }
  }

  public onNewMessage(handler: (message: RealtimeChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public onTypingIndicator(handler: (data: ChatTypingIndicator) => void): () => void {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  public onConnect(handler: () => void): () => void {
    this.connectHandlers.push(handler);
    return () => {
      this.connectHandlers = this.connectHandlers.filter(h => h !== handler);
    };
  }

  public onDisconnect(handler: () => void): () => void {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter(h => h !== handler);
    };
  }

  public isConnected(): boolean {
    return this.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;