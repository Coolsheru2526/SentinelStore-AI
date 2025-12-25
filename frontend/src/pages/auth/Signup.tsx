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
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const Signup = () => {
  const [username, setUsername] = useState('');
  const [storeId, setStoreId] = useState('store_1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username,
        password,
        store_id: storeId,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: { detail?: string } | unknown = await response
          .json()
          .catch(() => ({}));
        const message = (errorData as { detail?: string }).detail ?? 'Signup failed';
        alert(typeof message === 'string' ? message : 'Signup failed');
        return;
      }

      const data: { access_token?: string } = await response.json();
      const token = data.access_token as string | undefined;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        // If backend ever stops returning a token, fall back to login page.
        alert('Account created. Please log in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup failed', error);
      alert('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-r, purple.600, pink.600)"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-50%"
        right="-50%"
        w="200%"
        h="200%"
        bgGradient="radial(circle, rgba(168,85,247,0.1) 0%, transparent 70%)"
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
              AI‑powered loss prevention
            </Badge>
            <Heading size="2xl" lineHeight="short">
              Create your SentinelStore account
            </Heading>
            <Text fontSize="md" maxW="md" color="whiteAlpha.800">
              Onboard your store, connect sensors, and let the agentic incident engine
              watch for risks across all your retail locations.
            </Text>
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
                <Icon as={FiUser} color="purple.500" boxSize={8} />
              </Box>
              <Heading size="lg" color="white" fontWeight="bold">
                Get started in minutes
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
                    Create an account
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Set up access for your store's security team.
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
                          placeholder="Choose a username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          pl={10}
                          h={12}
                          borderRadius="lg"
                          borderColor="gray.200"
                          _hover={{ borderColor: 'purple.300' }}
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
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
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        pl={10}
                        pr={10}
                        h={12}
                        borderRadius="lg"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'purple.300' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
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
                  
                  <Box w="full">
                    <Text mb={2} fontWeight="medium" color="gray.700" fontSize="sm">
                      Confirm Password
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        pl={10}
                        pr={10}
                        h={12}
                        borderRadius="lg"
                        borderColor="gray.200"
                        _hover={{ borderColor: 'purple.300' }}
                        _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        right={2}
                        top="50%"
                        transform="translateY(-50%)"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        h={8}
                        w={8}
                        p={0}
                        _hover={{ bg: 'gray.100' }}
                      >
                        <Icon as={showConfirmPassword ? FiEyeOff : FiEye} color="gray.400" boxSize={4} />
                      </Button>
                    </Box>
                  </Box>
                  <Box w="full">
                    <Text mb={2} fontWeight="medium" color="gray.700" fontSize="sm">
                      Store ID
                    </Text>
                    <Input
                      type="text"
                      placeholder="Enter your store ID"
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      required
                      h={12}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'purple.300' }}
                      _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                    />
                  </Box>

                    <Button
                      type="submit"
                      colorScheme="purple"
                      width="full"
                      h={12}
                      mt={2}
                      loading={isLoading}
                      loadingText="Creating account..."
                      borderRadius="lg"
                      fontSize="md"
                      fontWeight="semibold"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      _hover={{
                        bgGradient: 'linear(to-r, purple.600, pink.600)',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{ transform: 'translateY(0)' }}
                      transition="all 0.2s"
                      boxShadow="md"
                    >
                      Sign Up
                    </Button>
                  </VStack>
                </form>

                <Box w="full" h="1px" bg="gray.100" my={6} />

                <HStack gap={1} justify="center">
                  <Text color="gray.600" fontSize="sm">
                    Already have an account?
                  </Text>
                  <Link to="/login">
                    <Text color="purple.500" fontWeight="semibold" fontSize="sm">
                      Sign in
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
