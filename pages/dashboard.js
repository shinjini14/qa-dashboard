import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tabs, Tab, Fade, Slide
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add,
  PlayArrow,
  CheckCircle,
  Schedule,
  Pending,
  OpenInNew,
  Edit,
  Delete,
  Assessment
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import DriveLinksManager from '../components/DriveLinksManager';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function QADashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [driveLinks, setDriveLinks] = useState([]);
  const [qaTasks, setQaTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load drive links
      try {
        const driveResponse = await axios.get('/api/drive-links');
        setDriveLinks(driveResponse.data.driveLinks || []);
        console.log('[Dashboard] Loaded drive links:', driveResponse.data.driveLinks?.length || 0);
      } catch (driveErr) {
        console.error('[Dashboard] Error loading drive links:', driveErr);
        setDriveLinks([]);
      }

      // Load QA tasks (optional, may fail if table doesn't exist)
      try {
        const qaResponse = await axios.get('/api/qa/tasks');
        setQaTasks(qaResponse.data.tasks || []);
        console.log('[Dashboard] Loaded QA tasks:', qaResponse.data.tasks?.length || 0);
      } catch (qaErr) {
        console.error('[Dashboard] Error loading QA tasks (non-critical):', qaErr);
        setQaTasks([]);
      }

    } catch (err) {
      console.error('[Dashboard] General error:', err);
      setError('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get status counts
  const getStatusCounts = () => {
    if (!Array.isArray(driveLinks)) {
      return { pending: 0, inProgress: 0, completed: 0 };
    }

    const pending = driveLinks.filter(link => link.status === 'pending' || !link.status).length;
    const inProgress = driveLinks.filter(link => link.status === 'in_progress').length;
    const completed = driveLinks.filter(link => link.status === 'completed').length;

    return { pending, inProgress, completed };
  };

  const statusCounts = getStatusCounts();

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'in_progress': return <Schedule />;
      case 'completed': return <CheckCircle />;
      default: return <Pending />;
    }
  };

  // Continue QA task
  const continueQA = (link) => {
    // Store the drive link for QA continuation
    localStorage.setItem('qa_continue_link', JSON.stringify({
      drive_url: link.full_url,
      file_id: link.file_id
    }));
    router.push('/');
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #304ffe, #5472ff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              QA Management Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Manage drive links and track QA progress
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Status Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Slide direction="right" in timeout={600}>
                <Card sx={{
                  p: 3,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(255, 193, 7, 0.2)',
                  textAlign: 'center'
                }}>
                  <Pending sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                  <Typography variant="h4" fontWeight={600} color="#ff9800">
                    {statusCounts.pending}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Pending QA
                  </Typography>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="up" in timeout={800}>
                <Card sx={{
                  p: 3,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(33, 150, 243, 0.2)',
                  textAlign: 'center'
                }}>
                  <Schedule sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                  <Typography variant="h4" fontWeight={600} color="#2196f3">
                    {statusCounts.inProgress}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    In Progress
                  </Typography>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="left" in timeout={1000}>
                <Card sx={{
                  p: 3,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  textAlign: 'center'
                }}>
                  <CheckCircle sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h4" fontWeight={600} color="#4caf50">
                    {statusCounts.completed}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Completed
                  </Typography>
                </Card>
              </Slide>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Card sx={{
            background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
            border: '1px solid rgba(48, 79, 254, 0.2)'
          }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                borderBottom: '1px solid rgba(48, 79, 254, 0.2)',
                '& .MuiTab-root': {
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: '#304ffe'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#304ffe'
                }
              }}
            >
              <Tab
                icon={<Add />}
                label="Add Drive Links"
                iconPosition="start"
              />
              <Tab
                icon={<Assessment />}
                label="QA Progress"
                iconPosition="start"
              />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              <DriveLinksManager showWelcomeMessage={false} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  QA Tasks Overview
                </Typography>
                
                {/* QA Tasks Table */}
                <TableContainer component={Paper} sx={{
                  background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  border: '1px solid rgba(48, 79, 254, 0.1)'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: '#304ffe' }}>File ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#304ffe' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#304ffe' }}>Created</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#304ffe' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(driveLinks) && driveLinks.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {link.file_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(link.status || 'pending')}
                              label={link.status || 'pending'}
                              color={getStatusColor(link.status || 'pending')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {link.created_at ? new Date(link.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => window.open(link.full_url, '_blank')}
                                title="Open Drive Link"
                              >
                                <OpenInNew />
                              </IconButton>
                              {(link.status === 'in_progress' || link.status === 'pending') && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<PlayArrow />}
                                  onClick={() => continueQA(link)}
                                  sx={{
                                    background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {link.status === 'in_progress' ? 'Continue' : 'Start'} QA
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {(!Array.isArray(driveLinks) || driveLinks.length === 0) && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    {loading ? 'Loading drive links...' : 'No drive links found. Add some drive links to get started with QA.'}
                  </Alert>
                )}
              </Box>
            </TabPanel>
          </Card>
        </Box>
      </Fade>
    </Layout>
  );
}
