import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Stack,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Paper,
  Alert,
  Fade,
} from '@mui/material';
import { FiLock, FiUser, FiEye, FiEyeOff, FiShield, FiActivity } from 'react-icons/fi';
import { Icon } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      const body = new URLSearchParams();
      body.append('username', username.trim());
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
        setError(typeof message === 'string' ? message : 'Login failed');
        return;
      }

      const data: { access_token?: string } = await response.json();
      const token = data.access_token as string | undefined;
      if (!token) {
        setError('Login failed: no token returned');
        return;
      }

      localStorage.setItem('token', token);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
            '50%': { transform: 'translate(-50px, -50px) rotate(180deg)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          filter: 'blur(60px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }}
      />
      
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left: Marketing / Hero */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Fade in timeout={800}>
              <Stack spacing={4} color="white">
                <Chip
                  label="Smart Mall Security"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    color: 'white',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    height: '28px',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Typography 
                  variant="h1" 
                  sx={{ 
                    color: 'white', 
                    lineHeight: 1.2,
                    fontWeight: 800,
                    fontSize: { md: '3.5rem', lg: '4rem' },
                  }}
                >
                  SentinelStore AI
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    maxWidth: 'md',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                  }}
                >
                  Monitor your retail store in real time with AI-powered incident detection
                  across cameras, microphones, and video feeds.
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Icon component={FiShield} sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 0.5 }}>Multi‑sensor analysis</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Vision, audio, and video fused into one incident view.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Icon component={FiActivity} sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 0.5 }}>Risk scoring</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        See severity and escalation paths instantly.
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            </Fade>
          </Grid>

          {/* Right: Auth card */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Stack spacing={3} alignItems="center">
                <Paper
                  elevation={24}
                  sx={{
                    width: '100%',
                    maxWidth: '480px',
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Stack spacing={3}>
                    <Stack spacing={1} textAlign="center" sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: 'primary.main',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 1,
                          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                        }}
                      >
                        <Icon component={FiLock} sx={{ fontSize: 36, color: 'white' }} />
                      </Box>
                      <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
                        Welcome Back
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Sign in to access your dashboard
                      </Typography>
                    </Stack>

                    {error && (
                      <Alert 
                        severity="error" 
                        onClose={() => setError(null)}
                        sx={{ borderRadius: 2 }}
                      >
                        {error}
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                      <Stack spacing={2.5}>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                            Username
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            size="medium"
                            autoFocus
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon component={FiUser} sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '50px',
                                borderRadius: '12px',
                                bgcolor: 'grey.50',
                                '&:hover fieldset': {
                                  borderColor: 'primary.light',
                                },
                                '&.Mui-focused': {
                                  bgcolor: 'white',
                                  '& fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px',
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                            Password
                          </Typography>
                          <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon component={FiLock} sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <Icon component={showPassword ? FiEyeOff : FiEye} />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '50px',
                                borderRadius: '12px',
                                bgcolor: 'grey.50',
                                '&:hover fieldset': {
                                  borderColor: 'primary.light',
                                },
                                '&.Mui-focused': {
                                  bgcolor: 'white',
                                  '& fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px',
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={isLoading}
                          sx={{
                            height: '52px',
                            mt: 1,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                            '&:disabled': {
                              background: 'grey.300',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </Stack>
                    </form>

                    <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.200', my: 2 }} />

                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Don't have an account?
                      </Typography>
                      <Link to="/signup" style={{ textDecoration: 'none' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.main', 
                            fontWeight: 600,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Sign up
                        </Typography>
                      </Link>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
