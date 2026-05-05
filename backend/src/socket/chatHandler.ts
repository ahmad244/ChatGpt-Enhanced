import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { User } from '../models/User';

interface JwtPayload {
  id: string;
}

interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    role: 'user' | 'assistant' | 'system';
  };
  conversationId: string;
  timestamp: Date;
}

interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

/**
 * Handle chat socket communications
 * @param {Server} io - Socket.io instance
 */
const setupChatHandlers = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret') as JwtPayload;
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user data to socket
      (socket as any).user = {
        id: user._id,
        name: user.email,
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user?.id;
    const userName = (socket as any).user?.name;
    
    console.log(`Chat client connected: ${socket.id}, User: ${userName} (${userId})`);
    
    // Handle joining a conversation
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        // Verify user belongs to this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });
        
        if (!conversation) {
          socket.emit('error', { message: 'Access denied: Not a participant in this conversation' });
          return;
        }
        
        // Join the conversation room
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userName} joined conversation ${conversationId}`);
        
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });
    
    // Handle leaving a conversation
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userName} left conversation ${conversationId}`);
    });
    
    // Handle sending a message
    socket.on('send_message', async (data: ChatMessage) => {
      try {
        const { content, conversationId, _id: tempId } = data;
        
        // Verify user belongs to this conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });
        
        if (!conversation) {
          socket.emit('error', { 
            message: 'Access denied: Not a participant in this conversation',
            tempId
          });
          return;
        }
        
        // Create new message
        const newMessage = await Message.create({
          content,
          role: 'user',
          conversationId: conversationId,
          timestamp: new Date(),
        });
        
        // Update conversation with new message and updated timestamp
        await Conversation.findByIdAndUpdate(
          conversationId,
          { 
            $push: { messages: newMessage._id },
            $set: { updatedAt: new Date() }
          }
        );
        
        // Format the message to send to clients
        const formattedMessage = {
          _id: newMessage._id,
          content: newMessage.content,
          sender: {
            _id: userId,
            role: 'user'
          },
          timestamp: newMessage.timestamp,
          tempId // Include the temporary ID for client reference
        };
        
        // Broadcast to all users in the conversation
        io.to(`conversation:${conversationId}`).emit('new_message', formattedMessage);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { 
          message: 'Failed to send message',
          tempId: data._id
        });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data: TypingIndicator) => {
      const { conversationId, isTyping } = data;
      
      // Add user info to the typing data
      const typingData = {
        ...data,
        userId,
        userName
      };
      
      // Broadcast to everyone in the conversation except sender
      socket.to(`conversation:${conversationId}`).emit('typing', typingData);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Chat client disconnected: ${socket.id}, User: ${userName}`);
    });
  });
};

export default setupChatHandlers;