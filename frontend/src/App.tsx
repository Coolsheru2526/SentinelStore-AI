import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';

// Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { Dashboard } from './pages/Dashboard';
import { FileUpload } from './pages/FileUpload';
import { IncidentDetail } from './pages/IncidentDetail';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import Chat from './components/Chat';

// Create a client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppContent() {
  const location = useLocation();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                  <FileUpload />
                </Container>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/incident"
          element={
            <ProtectedRoute>
              <Layout>
                <IncidentDetail key={location.search} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        /> 
        {/* Redirect to login for any other route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
        <Router>
          <AppContent />
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
