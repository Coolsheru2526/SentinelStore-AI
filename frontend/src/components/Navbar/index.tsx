import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, IconButton, Text, Button } from '@chakra-ui/react';
import { FiBell, FiUser } from 'react-icons/fi';

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
    <Box
      bg="white"
      px={4}
      py={3}
      mb={4}
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          SentinelStore AI
        </Text>

        <Flex alignItems="center">
          {user && (
            <Box textAlign="right" mr={4}>
              <Text fontSize="sm" fontWeight="medium">
                {user.username}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Store: {user.store_id}
              </Text>
            </Box>
          )}

          <IconButton aria-label="Notifications" variant="ghost" mr={2}>
            <FiBell />
          </IconButton>
          <IconButton aria-label="User profile" variant="ghost" mr={2}>
            <FiUser />
          </IconButton>
          <Button size="sm" variant="outline" colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};
