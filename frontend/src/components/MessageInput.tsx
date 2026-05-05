import React, { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <Paper>
      <Box component="form" onSubmit={handleSubmit} p={2}>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button 
            type="submit"
            variant="contained" 
            color="primary"
            endIcon={<SendIcon />}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MessageInput;
