// frontend/src/components/Chat/ChatWindow.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as InsertEmoticonIcon,
} from '@mui/icons-material';
import { useChat } from './ChatProvider';
import { format } from 'date-fns';

type Timeout = ReturnType<typeof setTimeout>;

// Helper function to generate consistent color from string
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
};

export const ChatWindow: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    socket,
    isConnected,
    rooms,
    currentRoom,
    messages,
    users,
    joinRoom,
    sendMessage,
    startDirectMessage,
  } = useChat();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<Timeout | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle window resize
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(true);
    }
  }, [isMobile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentRoom) return;

    try {
      await sendMessage(message);
      setMessage('');
      // Focus input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle user typing with debounce
  const handleStartTyping = useCallback(
    debounce(() => {
      if (!socket || !currentRoom) return;
      
      // Get the current user from the users list
      const currentUser = users.find(u => u.user_id === socket?.id);
      if (!currentUser) return;
      
      // Emit typing event
      socket.emit('typing', {
        roomId: currentRoom.room_id,
        userId: socket.id,
        username: currentUser.username
      });
    }, 1000),
    [socket, currentRoom, users]
  );
  
  // Handle incoming typing events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: { userId: string; username: string }) => {
      if (data.userId !== socket?.id) {
        setTypingUser(data.username);
        setIsTyping(true);
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set a timeout to hide the typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    };

    socket.on('user_typing', handleUserTyping);

    // Cleanup
    return () => {
      socket.off('user_typing', handleUserTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket]);

  const handleRoomSelect = async (room: any) => {
    try {
      await joinRoom(room.room_id);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleStartDirectMessage = async (userId: string) => {
    try {
      await startDirectMessage(userId);
      if (isMobile) {
        setDrawerOpen(false);
      }
    } catch (error) {
      console.error('Failed to start DM:', error);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const otherUsers = users.filter(user => 
    user.user_id !== socket?.id && // Exclude self
    !rooms.some(room => 
      room.is_direct && 
      room.members?.some(member => member.user_id === user.user_id)
    )
  );

  const filteredOtherUsers = otherUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      backgroundColor: theme.palette.background.default
    }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" noWrap>
              Chat
            </Typography>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {/* Rooms */}
          <List>
            <ListItem>
              <Typography variant="subtitle2" color="text.secondary">
                Your Chats
              </Typography>
            </ListItem>
            {filteredRooms.map((room) => (
              <ListItemButton
                key={room.room_id}
                selected={currentRoom?.room_id === room.room_id}
                onClick={() => handleRoomSelect(room)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    }
                  }
                }}
              >
                <ListItemIcon>
                  {room.is_direct ? <PersonIcon /> : <GroupIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary={room.name}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontWeight: currentRoom?.room_id === room.room_id ? 'medium' : 'normal'
                  }}
                  secondary={
                    room.last_message 
                      ? room.last_message.content.substring(0, 30) + 
                        (room.last_message.content.length > 30 ? '...' : '')
                      : 'No messages yet'
                  }
                  secondaryTypographyProps={{
                    noWrap: true,
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                {room.unread_count > 0 && (
                  <Badge 
                    badgeContent={room.unread_count} 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>

          {/* Online Users */}
          <List>
            <ListItem>
              <Typography variant="subtitle2" color="text.secondary">
                Online Users
              </Typography>
            </ListItem>
            {filteredOtherUsers.map((user) => (
              <ListItemButton
                key={user.user_id}
                onClick={() => handleStartDirectMessage(user.user_id)}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                  >
                    <Avatar 
                      alt={user.username} 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: stringToColor(user.username),
                        color: 'white',
                        fontSize: '0.875rem'
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.username}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontWeight: 'medium'
                  }}
                  secondary={
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'success.main',
                          mr: 0.5 
                        }} 
                      />
                      Online
                    </Box>
                  }
                  secondaryTypographyProps={{
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        backgroundColor: theme.palette.background.paper
      }}>
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: theme.palette.background.paper,
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  mr: 1
                }} />
                <Typography variant="caption" color="text.secondary">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isMobile && (
                  <IconButton 
                    onClick={() => setDrawerOpen(true)} 
                    sx={{ mr: 1 }}
                  >
                    <MenuIcon />
                  </IconButton>
                )}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {currentRoom.name}
                    {!isConnected && (
                      <Typography component="span" variant="caption" color="error.main" sx={{ ml: 1 }}>
                        (disconnected)
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentRoom.is_direct 
                      ? users.find(u => u.user_id !== socket?.id)?.online 
                        ? 'Online' 
                        : 'Offline'
                      : `${users.length} ${users.length === 1 ? 'member' : 'members'}`
                    }
                  </Typography>
                </Box>
              </Box>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
            }}>
              {messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  textAlign: 'center',
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6" gutterBottom>
                    No messages yet
                  </Typography>
                  <Typography variant="body2">
                    {currentRoom.is_direct
                      ? `Start a conversation with ${currentRoom.name}`
                      : 'Send a message to start the conversation'
                    }
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {messages.map((msg, index) => {
                    const isCurrentUser = msg.user_id === socket?.id;
                    const showAvatar = index === 0 || 
                                     messages[index - 1].user_id !== msg.user_id || 
                                     (new Date(msg.timestamp).getTime() - 
                                      new Date(messages[index - 1].timestamp).getTime()) > 5 * 60 * 1000; // 5 minutes

                    return (
                      <React.Fragment key={msg.id}>
                        {(index === 0 || 
                          new Date(msg.timestamp).toDateString() !== 
                          new Date(messages[index - 1].timestamp).toDateString()) && (
                          <Box sx={{ 
                            textAlign: 'center', 
                            my: 2,
                            '&:before': {
                              content: '""',
                              display: 'block',
                              height: '1px',
                              backgroundColor: theme.palette.divider,
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: '50%',
                              zIndex: -1
                            }
                          }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                bgcolor: 'background.paper', 
                                px: 2,
                                color: 'text.secondary'
                              }}
                            >
                              {format(new Date(msg.timestamp), 'MMMM d, yyyy')}
                            </Typography>
                          </Box>
                        )}
                        
                        <ListItem 
                          alignItems="flex-start"
                          sx={{
                            flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                            px: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              borderRadius: 1
                            }
                          }}
                        >
                          {!isCurrentUser && showAvatar && (
                            <Box sx={{ 
                              alignSelf: 'flex-end',
                              mb: 'auto',
                              visibility: showAvatar ? 'visible' : 'hidden'
                            }}>
                              <Avatar 
                                alt={msg.username} 
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: stringToColor(msg.username),
                                  color: 'white',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {msg.username.charAt(0).toUpperCase()}
                              </Avatar>
                            </Box>
                          )}
                          
                          <Box 
                            sx={{ 
                              maxWidth: '70%',
                              mx: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
                            }}
                          >
                            {!isCurrentUser && showAvatar && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: 'text.secondary',
                                  ml: 1
                                }}
                              >
                                {msg.username}
                              </Typography>
                            )}
                            
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isCurrentUser 
                                  ? theme.palette.primary.main 
                                  : theme.palette.background.paper,
                                color: isCurrentUser 
                                  ? theme.palette.primary.contrastText 
                                  : theme.palette.text.primary,
                                border: `1px solid ${
                                  isCurrentUser 
                                    ? 'transparent' 
                                    : theme.palette.divider
                                }`,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              <Typography variant="body2">
                                {msg.content}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block',
                                  textAlign: 'right',
                                  mt: 0.5,
                                  color: isCurrentUser 
                                    ? 'rgba(255, 255, 255, 0.7)' 
                                    : 'text.secondary',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {format(new Date(msg.timestamp), 'h:mm a')}
                              </Typography>
                            </Paper>
                          </Box>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Box>

            {/* Message Input */}
            <Box 
              component="form" 
              onSubmit={handleSendMessage}
              sx={{ 
                p: 2, 
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              {isTyping && typingUser && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    fontStyle: 'italic'
                  }}
                >
                  {typingUser} is typing...
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton>
                  <AttachFileIcon />
                </IconButton>
                <IconButton>
                  <InsertEmoticonIcon />
                </IconButton>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message..."
                  size="small"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleStartTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  multiline
                  maxRows={4}
                  inputRef={inputRef}
                  InputProps={{
                    sx: {
                      borderRadius: 4,
                      backgroundColor: theme.palette.background.default,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!message.trim()}
                  sx={{ 
                    minWidth: 'auto',
                    height: '40px',
                    borderRadius: '50%',
                    p: 0
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            textAlign: 'center',
            p: 3,
            color: 'text.secondary'
          }}>
            <GroupIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              Welcome to the Chat
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {rooms.length === 0
                ? 'You have no active conversations. Start by searching for users.'
                : 'Select a conversation or start a new one'
              }
            </Typography>
            {rooms.length === 0 && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => setDrawerOpen(true)}
              >
                Start Chatting
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatWindow;