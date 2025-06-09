import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login as LoginIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[Login] Checking auth status...');
      const response = await axios.get('/api/auth/me');
      console.log('[Login] Auth check response:', response.data);

      if (response.data.success) {
        console.log('[Login] User already authenticated, redirecting...');
        router.push('/');
      } else {
        console.log('[Login] User not authenticated, staying on login page');
      }
    } catch (error) {
      console.log('[Login] Auth check failed:', error.response?.data || error.message);
      // User not authenticated, stay on login page
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('[Login] Submitting login form with:', { username: formData.username });

    try {
      const response = await axios.post('/api/auth/login', formData);
      console.log('[Login] Login response:', response.data);

      if (response.data.success) {
        console.log('[Login] Login successful, redirecting to home...');

        // Wait a moment for cookie to be set, then force a page reload to ensure cookie is recognized
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
      } else {
        console.log('[Login] Login failed:', response.data.message);
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('[Login] Login error:', error);
      setError(
        error.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(45deg, #7c4dff, #304ffe)',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite reverse'
        }}
      />

      <Container maxWidth="sm">
        <Fade in={mounted} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 6,
              background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
              borderRadius: 4,
              border: '1px solid rgba(48, 79, 254, 0.2)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glowing border effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, #304ffe, transparent, #7c4dff, transparent)',
                borderRadius: 4,
                padding: '2px',
                zIndex: -1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '2px',
                  left: '2px',
                  right: '2px',
                  bottom: '2px',
                  background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
                  borderRadius: 'inherit',
                  zIndex: -1
                }
              }}
            />

            <Slide direction="down" in={mounted} timeout={600}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 32px rgba(48, 79, 254, 0.3)'
                  }}
                >
                  <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to access your QA Dashboard
                </Typography>
              </Box>
            </Slide>

            {error && (
              <Fade in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#304ffe' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(48, 79, 254, 0.2)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 20px rgba(48, 79, 254, 0.3)'
                    }
                  }
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#304ffe' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#304ffe' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 20px rgba(48, 79, 254, 0.2)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 20px rgba(48, 79, 254, 0.3)'
                    }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(48, 79, 254, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e3aff, #6c3dff)',
                    boxShadow: '0 12px 40px rgba(48, 79, 254, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                    opacity: 0.7
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
}
