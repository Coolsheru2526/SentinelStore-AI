import { Box, VStack, Icon, Text, HStack, LinkBox } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiPieChart, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, children, to, isActive }: NavItemProps) => {
  const activeBg = 'brand.50';
  const activeColor = 'brand.600';
  const hoverBg = 'gray.100';
  const color = 'gray.600';

  return (
    <LinkBox as="div" w="full">
      <RouterLink to={to} style={{ textDecoration: 'none' }}>
        <HStack
          px={4}
          py={3}
          borderRadius="lg"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : color}
          _hover={!isActive ? { bg: hoverBg } : {}}
          transition="all 0.2s"
        >
          <Icon as={icon} boxSize={5} />
          <Text fontWeight={isActive ? 'semibold' : 'normal'}>{children}</Text>
        </HStack>
      </RouterLink>
    </LinkBox>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const bg = 'white';
  const borderColor = 'gray.200';

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiAlertCircle, label: 'Alerts', path: '/alerts' },
    { icon: FiUsers, label: 'Customers', path: '/customers' },
    { icon: FiShoppingBag, label: 'Products', path: '/products' },
    { icon: FiPieChart, label: 'Analytics', path: '/analytics' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w={{ base: '60px', md: '240px' }}
      bg={bg}
      borderRightWidth="1px"
      borderColor={borderColor}
      py={4}
      transition="all 0.2s"
      _hover={{ width: { base: '240px', md: '240px' } }}
      overflowX="hidden"
      zIndex={10}
    >
      <VStack align="stretch" style={{ gap: '0.25rem' }} px={2}>
        <Box px={4} py={2} mb={4} display={{ base: 'none', md: 'block' }}>
          <Text fontSize="xl" fontWeight="bold" color="brand.500">
            SentinelStore
          </Text>
        </Box>
        
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            <Box display={{ base: 'none', md: 'block' }}>{item.label}</Box>
          </NavItem>
        ))}
      </VStack>
    </Box>
  );
};
