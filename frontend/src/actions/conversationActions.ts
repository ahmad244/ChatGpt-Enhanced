import { Dispatch } from 'redux';
import { ActionTypes, Action, Conversation, Message } from '../types';

// API service to make actual calls
const api = {
  getConversation: async (id: string): Promise<Conversation> => {
    // Replace with actual API call
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    return response.json();
  },
  
  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    // Replace with actual API call
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  }
};

// Action creators
export const fetchConversation = (conversationId: string) => {
  return async (dispatch: Dispatch<Action>) => {
    try {
      const conversation = await api.getConversation(conversationId);
      dispatch({
        type: ActionTypes.FETCH_CONVERSATION,
        payload: conversation,
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Handle error state if needed
    }
  };
};

export const sendMessage = (conversationId: string, content: string) => {
  return async (dispatch: Dispatch<Action>) => {
    try {
      const message = await api.sendMessage(conversationId, content);
      dispatch({
        type: ActionTypes.SEND_MESSAGE,
        payload: message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error state if needed
    }
  };
};
