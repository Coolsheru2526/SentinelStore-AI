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
import { FiUser, FiLock, FiEye, FiEyeOff, FiUserPlus, FiShoppingBag } from 'react-icons/fi';
import { Icon } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const Signup = () => {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!storeId.trim()) {
      setError('Store ID is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: username.trim(),
        full_name: fullName.trim(),
        password,
        store_id: storeId.trim(),
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
        setError(typeof message === 'string' ? message : 'Signup failed');
        return;
      }

      const data: { access_token?: string } = await response.json();
      const token = data.access_token as string | undefined;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        setError('Account created. Please log in.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Signup failed', error);
      setError('Signup failed. Please try again.');
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
                  label="AI‑powered loss prevention"
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
                  Create your SentinelStore account
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
                  Onboard your store, connect sensors, and let the agentic incident engine
                  watch for risks across all your retail locations.
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
                      <Icon component={FiUserPlus} sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 0.5 }}>Quick Setup</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Get started in under 2 minutes
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
                      <Icon component={FiShoppingBag} sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} sx={{ mb: 0.5 }}>Multi-Store Support</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Manage multiple locations from one dashboard
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
                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                        }}
                      >
                        <Icon component={FiUserPlus} sx={{ fontSize: 36, color: 'white' }} />
                      </Box>
                      <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 700 }}>
                        Create Account
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Fill in your details to get started
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
                            Full Name <span style={{ color: '#ef4444' }}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                            required
                            size="medium"
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
                            Username <span style={{ color: '#ef4444' }}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            size="medium"
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
                            Store ID <span style={{ color: '#ef4444' }}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            placeholder="Enter your store ID"
                            value={storeId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreId(e.target.value)}
                            required
                            size="medium"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icon component={FiShoppingBag} sx={{ color: 'text.secondary' }} />
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
                            Password <span style={{ color: '#ef4444' }}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password (min. 6 characters)"
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
                      
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                            Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                          </Typography>
                          <TextField
                            fullWidth
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    size="small"
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <Icon component={showConfirmPassword ? FiEyeOff : FiEye} />
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
                            mt: 2,
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
                          {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </Stack>
                    </form>

                    <Box sx={{ width: '100%', height: '1px', bgcolor: 'grey.200', my: 2 }} />

                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Already have an account?
                      </Typography>
                      <Link to="/login" style={{ textDecoration: 'none' }}>
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
                          Sign in
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
