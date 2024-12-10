import React from 'react';
import { Box, Typography } from '@mui/material';

interface RichTextProps {
  content: string;
}

const RichTextRenderer: React.FC<RichTextProps> = ({ content }) => {
  const formatText = (text: string) => {
    const formattedText = text
      .replace(/### \*\*(.*?)\*\*/g, '<h3>$1</h3>') // Convert headers
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/- (.*?)$/gm, '<li>$1</li>') // List items
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br>'); // Line breaks for paragraphs
    return formattedText;
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        component="div"
        dangerouslySetInnerHTML={{ __html: formatText(content) }}
        sx={{
          h3: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            margin: '4px 0', // Tighter margins
            lineHeight: 1.2,
          },
          strong: { fontWeight: 'bold' },
          li: {
            marginLeft: '1.2rem',
            marginBottom: '4px', // Minimal spacing between list items
            lineHeight: 1.4,
          },
          code: {
            backgroundColor: '#f4f4f4',
            padding: '1px 3px',
            borderRadius: '4px',
            fontFamily: 'monospace',
          },
          br: { display: 'block', lineHeight: 1 }, // Ensure no extra spacing for <br>
        }}
      />
    </Box>
  );
};

export default RichTextRenderer;
