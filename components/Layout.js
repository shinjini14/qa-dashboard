import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Container
} from '@mui/material';
import {
  Logout,
  Person,
  Dashboard,
  Assessment,
  Link as LinkIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleDashboard = () => {
    router.push('/dashboard'); // Navigate to QA dashboard
  };

  const handleGoToQA = () => {
    router.push('/'); // Navigate back to main QA dashboard
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderBottom: '1px solid rgba(48, 79, 254, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 20px rgba(48, 79, 254, 0.3)'
              }}
            >
              <Dashboard sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              QA Pipeline
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Dashboard Button */}
            <Button
              startIcon={<Dashboard />}
              onClick={handleDashboard}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: '#304ffe',
                borderColor: 'rgba(48, 79, 254, 0.5)',
                border: '1px solid',
                borderRadius: 2,
                px: 2,
                py: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#304ffe',
                  backgroundColor: 'rgba(48, 79, 254, 0.1)',
                  boxShadow: '0 4px 20px rgba(48, 79, 254, 0.2)'
                }
              }}
            >
              Dashboard
            </Button>

            <Chip
              icon={<Assessment />}
              label="Quality Assurance"
              variant="outlined"
              clickable
              onClick={handleGoToQA}
              sx={{
                borderColor: 'rgba(48, 79, 254, 0.5)',
                color: '#304ffe',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '& .MuiChip-icon': {
                  color: '#304ffe'
                },
                '&:hover': {
                  borderColor: '#304ffe',
                  backgroundColor: 'rgba(48, 79, 254, 0.1)',
                  boxShadow: '0 4px 20px rgba(48, 79, 254, 0.2)'
                }
              }}
            />

            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0,
                border: '2px solid rgba(48, 79, 254, 0.3)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#304ffe',
                  boxShadow: '0 4px 20px rgba(48, 79, 254, 0.3)'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(48, 79, 254, 0.2)',
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.primary">
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 2, color: '#ff5252' }} />
                <Typography color="#ff5252">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
