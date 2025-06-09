// pages/404.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Custom404() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (!loading) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to login
        router.replace('/login');
      } else {
        // If authenticated, redirect to home
        router.replace('/');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while redirecting
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: 'white',
        gap: 2
      }}
    >
      <CircularProgress size={60} sx={{ color: '#304ffe' }} />
      <Typography variant="h6" sx={{ color: '#b0b0b0' }}>
        Redirecting...
      </Typography>
    </Box>
  );
}
