// pages/admin.js
import React from 'react';
import {
  Box, Typography
} from '@mui/material';
import Layout from '../components/Layout';
import DriveLinksManager from '../components/DriveLinksManager';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();

  // Check if user has admin access
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You need admin privileges to access this page.
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        {/* Simple Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Add Drive Links
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add Google Drive video links that need to be QA'd
          </Typography>
        </Box>

        {/* Drive Links Management */}
        <DriveLinksManager showWelcomeMessage={true} />
      </Box>
    </Layout>
  );
}
