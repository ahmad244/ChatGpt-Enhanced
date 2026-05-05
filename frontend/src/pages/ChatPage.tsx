import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversation, sendMessage } from '../actions/conversationActions';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import VoiceChat from '../components/VoiceChat';
import { RootState, Conversation } from '../types';

// Updated interface to match useParams requirements
interface RouteParams {
  [key: string]: string | undefined;
  conversationId: string;
}

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<RouteParams>();
  const dispatch = useDispatch<any>(); // Use any to allow thunk actions
  const conversation = useSelector((state: RootState) => state.conversation);
  const user = useSelector((state: RootState) => state.user);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchConversation(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (conversation) {
      setActiveConversation(conversation.data);
    }
  }, [conversation]);

  const handleSendMessage = (message: string): void => {
    if (activeConversation) {
      dispatch(sendMessage(activeConversation._id, message));
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="h5">Chat</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <MessageList messages={activeConversation?.messages || []} />
        </Grid>
        <Grid item xs={12}>
          <MessageInput onSendMessage={handleSendMessage} />
        </Grid>
      </Grid>
      
      {/* Add Voice Chat component if conversation is active */}
      {activeConversation && user && (
        <VoiceChat 
          userId={user._id} 
          conversationId={activeConversation._id} 
        />
      )}
      
    </Container>
  );
};

export default ChatPage;
