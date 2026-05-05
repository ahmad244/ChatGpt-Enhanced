import React from 'react';
import { Box, Typography, Paper, List, ListItem } from '@mui/material';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Conversation
        </Typography>
        <List>
          {messages.length === 0 ? (
            <Typography color="textSecondary">
              No messages yet. Start a conversation!
            </Typography>
          ) : (
            messages.map((message) => (
              <ListItem 
                key={message._id}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: message.sender.role === 'user' ? 'primary.light' : 'background.paper',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Paper>
  );
};

export default MessageList;
