import { useNavigate } from 'react-router-dom';
import { Box, Stack, Paper, Typography, IconButton, Button, Badge } from '@mui/material';
import { FiBell, FiUser } from 'react-icons/fi';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../Chat/ChatProvider';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { rooms } = useChat();
  const unreadCount = rooms.reduce((total, room) => total + (room.unread_count || 0), 0);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        borderRadius: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* Left side - Logo/Brand */}
        <Box>
          <Typography variant="h6" fontWeight="bold">
            SentinelStore
          </Typography>
        </Box>

        {/* Right side - User info and actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {user && (
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <Typography variant="body2" fontWeight={500}>
                {user.username}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Store: {user.store_id}
              </Typography>
            </Box>
          )}

          {/* Chat Button */}
          <IconButton 
            size="small" 
            onClick={() => navigate('/chat')}
            aria-label="Chat"
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error" 
              max={9}
            >
              <ChatIcon fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton size="small" aria-label="Notifications">
            <Badge badgeContent={4} color="error" max={9}>
              <FiBell />
            </Badge>
          </IconButton>
          
          <IconButton size="small" aria-label="Profile">
            <FiUser />
          </IconButton>
          
          <Button 
            size="small" 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};