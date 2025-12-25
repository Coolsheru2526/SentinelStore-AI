import { Box, Paper } from '@mui/material';
import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box sx={{ ml: { xs: 0, md: '240px' }, p: 2 }}>
        <Navbar />
        <Paper
          elevation={1}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
};
