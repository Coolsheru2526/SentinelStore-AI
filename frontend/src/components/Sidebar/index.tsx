import { Box, Stack, Typography, Paper } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiPieChart, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import { Icon } from '@mui/material';

interface NavItemProps {
  icon: React.ElementType;
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}

const NavItem = ({ icon, children, to, isActive }: NavItemProps) => {
  return (
    <RouterLink to={to} style={{ textDecoration: 'none' }}>
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: isActive ? 'primary.50' : 'transparent',
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            bgcolor: isActive ? 'primary.50' : 'grey.100',
          },
          transition: 'all 0.2s',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Icon component={icon} sx={{ fontSize: 20 }} />
          <Typography component="div" fontWeight={isActive ? 600 : 400}>{children}</Typography>
        </Stack>
      </Paper>
    </RouterLink>
  );
};

export const Sidebar = () => {
  const location = useLocation();

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
      component="nav"
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: { xs: '60px', md: '240px' },
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'grey.200',
        py: 2,
        transition: 'all 0.2s',
        overflowX: 'hidden',
        zIndex: 10,
        '&:hover': {
          width: { xs: '240px', md: '240px' },
        },
      }}
    >
      <Stack spacing={0.25} sx={{ px: 1 }}>
        <Box sx={{ px: 2, py: 1, mb: 2, display: { xs: 'none', md: 'block' } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
            SentinelStore
          </Typography>
        </Box>
        
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>{item.label}</Box>
          </NavItem>
        ))}
      </Stack>
    </Box>
  );
};
