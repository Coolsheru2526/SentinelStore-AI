import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Heading,
  Text,
  Flex,
  Container,
  Icon,
  VStack,
  HStack,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const errorData: { detail?: string } | unknown = await response
          .json()
          .catch(() => ({}));
        const message = (errorData as { detail?: string }).detail ?? 'Login failed';
        alert(typeof message === 'string' ? message : 'Login failed');
        return;
      }

      const data: { access_token?: string } = await response.json();
      const token = data.access_token as string | undefined;
      if (!token) {
        alert('Login failed: no token returned');
        return;
      }

      localStorage.setItem('token', token);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, blue.600, purple.700)"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-50%"
        left="-50%"
        w="200%"
        h="200%"
        bgGradient="radial(circle, rgba(99,102,241,0.1) 0%, transparent 70%)"
        zIndex={0}
      />
      
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={12} alignItems="center">
          {/* Left: Marketing / Hero */}
          <VStack align="flex-start" gap={6} color="white" display={{ base: 'none', md: 'flex' }}>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="whiteAlpha.200"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Smart Mall Security
            </Badge>
            <Heading size="2xl" lineHeight="short">
              SentinelStore AI
            </Heading>
            <Text fontSize="md" maxW="md" color="whiteAlpha.800">
              Monitor your retail store in real time with AI-powered incident detection
              across cameras, microphones, and video feeds.
            </Text>
            <HStack gap={6} fontSize="sm" color="whiteAlpha.900">
              <VStack align="flex-start" gap={1}>
                <Text fontWeight="semibold">Multi‑sensor analysis</Text>
                <Text color="whiteAlpha.700">Vision, audio, and video fused into one incident view.</Text>
              </VStack>
              <VStack align="flex-start" gap={1}>
                <Text fontWeight="semibold">Risk scoring</Text>
                <Text color="whiteAlpha.700">See severity and escalation paths instantly.</Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Right: Auth card */}
          <VStack gap={8}>
            <VStack gap={2}>
              <Box
                w={16}
                h={16}
                bg="white"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="xl"
              >
                <Icon as={FiLock} color="blue.500" boxSize={8} />
              </Box>
              <Heading size="lg" color="white" fontWeight="bold">
                SentinelStore AI Console
              </Heading>
            </VStack>

            <Box
              w="100%"
              maxW="420px"
              p={8}
              borderRadius="2xl"
              boxShadow="2xl"
              bg="white"
            >
              <VStack gap={6}>
                <VStack gap={2} textAlign="center" w="full">
                  <Heading as="h1" size="lg" color="gray.800">
                    Sign in to your store
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Use your username and password to access the dashboard.
                  </Text>
                </VStack>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack gap={4}>
                    <Box w="full">
                      <Text mb={2} fontWeight="medium" color="gray.700" fontSize="sm">
                        Username
                      </Text>
                      <Box position="relative">
                        <Icon
                          as={FiUser}
                          position="absolute"
                          left={3}
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          boxSize={4}
                        />
                        <Input
                          type="text"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          pl={10}
                          h={12}
                          borderRadius="lg"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'blue.300' }}
                          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                        />
                      </Box>
                    </Box>
                  
                  <Box w="full">
                    <Text mb={2} fontWeight="medium" color="gray.700" fontSize="sm">
                      Password
                    </Text>
                    <Box position="relative">
                      <Icon 
                        as={FiLock} 
                        position="absolute" 
                        left={3} 
                        top="50%" 
                        transform="translateY(-50%)" 
                        color="gray.400" 
                        boxSize={4} 
                      />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        pl={10}
                        pr={10}
                        h={12}
                        borderRadius="lg"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'blue.300' }}
                        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword(!showPassword)}
                        h={8}
                        w={8}
                        p={0}
                        _hover={{ bg: 'gray.100' }}
                      >
                        <Icon as={showPassword ? FiEyeOff : FiEye} color="gray.400" boxSize={4} />
                      </Button>
                    </Box>
                  </Box>
                  
                    <Button
                      type="submit"
                      colorScheme="blue"
                      width="full"
                      h={12}
                      mt={2}
                      loading={isLoading}
                      loadingText="Signing in..."
                      borderRadius="lg"
                      fontSize="md"
                      fontWeight="semibold"
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      _hover={{
                        bgGradient: 'linear(to-r, blue.600, purple.600)',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{ transform: 'translateY(0)' }}
                      transition="all 0.2s"
                      boxShadow="md"
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>

                <Box w="full" h="1px" bg="gray.100" my={6} />

                <HStack gap={1} justify="center">
                  <Text color="gray.600" fontSize="sm">
                    Don't have an account?
                  </Text>
                  <Link to="/signup">
                    <Text color="blue.500" fontWeight="semibold" fontSize="sm">
                      Sign up
                    </Text>
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>
    </Flex>
  );
};
