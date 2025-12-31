// frontend/src/components/Chat/index.tsx
import React from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatProvider } from './ChatProvider';
import { Box } from '@mui/material';

export const Chat: React.FC = () => {
  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', // Adjust based on your app's header height
      width: '100%',
      display: 'flex'
    }}>
      <ChatProvider>
        <ChatWindow />
      </ChatProvider>
    </Box>
  );
};

export default Chat;