import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />
      <Box ml={{ base: 0, md: '240px' }} p="4">
        <Navbar />
        <Box
          bg="white"
          borderRadius="lg"
          p={6}
          boxShadow="sm"
          minH="calc(100vh - 120px)"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
