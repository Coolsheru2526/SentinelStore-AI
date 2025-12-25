import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, IconButton, Typography, Button, Paper } from '@mui/material';
import { FiBell, FiUser } from 'react-icons/fi';
import { Icon } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

type CurrentUser = {
  username: string;
  store_id: string;
  role?: string;
};

export const Navbar = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        setUser({
          username: data.username,
          store_id: data.store_id,
          role: data.role,
        });
      } catch (error) {
        console.error('Failed to fetch current user', error);
      }
    };

    void fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Paper
      elevation={1}
      sx={{
        px: 2,
        py: 1.5,
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
          SentinelStore AI
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
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

          <IconButton size="small">
            <Icon component={FiBell} />
          </IconButton>
          <IconButton size="small">
            <Icon component={FiUser} />
          </IconButton>
          <Button size="small" variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
