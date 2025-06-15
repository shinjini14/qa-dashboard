import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, FormControl,
  InputLabel, Select, MenuItem, Button,
  Grid, Alert, Chip, Fade, Slide
} from '@mui/material';
import {
  PlayArrow,
  CloudDownload,
  AccountCircle,
  Preview,
  DriveFileRenameOutline,
  VideoLibrary,
  CheckCircle,
  Add,
  Settings
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';

// helper to turn any YouTube URL into an embed URL
function toEmbedUrl(watchUrl) {
  try {
    const m = watchUrl.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
    if (m && m[1]) {
      const id = m[1];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
  } catch {}
  return watchUrl;
}

export default function FrameWelcome({
  accounts,
  selectedAccount,
  onAccountChange,
  onStart,
  error
}) {
  const router = useRouter();
  const [driveLinks, setDriveLinks]       = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [reference, setReference]         = useState(null);

  // 1️⃣ Fetch all Drive links
  useEffect(() => {
    axios.get('/api/drive-links')
      .then(res => {
        console.log('[FrameWelcome] driveLinks loaded:', res.data.driveLinks);
        setDriveLinks(res.data.driveLinks);
      })
      .catch(err => {
        console.error('[FrameWelcome] failed to load drive-links:', err);
      });
  }, []);

  // 2️⃣ When selectedAccount changes, fetch reference
  useEffect(() => {
    console.log('[FrameWelcome] selectedAccount changed:', selectedAccount);
    if (!selectedAccount) {
      setReference(null);
      // Clear localStorage when no account selected
      localStorage.removeItem('qa_reference_video');
      return;
    }
    axios.get('/api/reference-preview', { params: { account: selectedAccount } })
      .then(res => {
        console.log('[FrameWelcome] reference data:', res.data.preview);
        const referenceData = res.data.preview || null;
        setReference(referenceData);

        // Store reference video in localStorage for QA use
        if (referenceData) {
          localStorage.setItem('qa_reference_video', JSON.stringify({
            video_url: referenceData.video_url,
            embed_url: referenceData.embed_url,
            account_id: selectedAccount
          }));
          console.log('[FrameWelcome] stored reference video in localStorage:', referenceData);
        } else {
          localStorage.removeItem('qa_reference_video');
        }
      })
      .catch(err => {
        console.error('[FrameWelcome] reference-fetch error:', err);
        setReference(null);
        localStorage.removeItem('qa_reference_video');
      });
  }, [selectedAccount]);

  // 3️⃣ Log whenever selectedDrive or reference updates
  useEffect(() => {
    console.log('[FrameWelcome] selectedDrive:', selectedDrive);
  }, [selectedDrive]);

  useEffect(() => {
    console.log('[FrameWelcome] embedSrc:', reference?.embed_url || reference?.video_url);
  }, [reference]);

  const canStart = Boolean(selectedDrive && selectedAccount);

  // decide iframe src
  let embedSrc = null;
  if (reference?.embed_url) {
    embedSrc = reference.embed_url;
  } else if (reference?.video_url) {
    embedSrc = toEmbedUrl(reference.video_url);
  }

  return (
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
            Quality Assurance Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Pick a Drive video, then select your account to load its reference
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Controls */}
          <Grid item xs={12} lg={8}>
            <Slide direction="up" in timeout={600}>
              <Card
                sx={{
                  p: 4,
                  height: '100%',
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(48,79,254,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Drive Link Dropdown */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Drive Video</InputLabel>
                    <Select
                      value={selectedDrive}
                      label="Drive Video"
                      onChange={e => setSelectedDrive(e.target.value)}
                      startAdornment={<DriveFileRenameOutline sx={{ mr: 1 }} />}
                    >
                      {driveLinks.map(dl => (
                        <MenuItem key={dl.id} value={dl.full_url}>
                          {dl.file_id}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Account Dropdown */}
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Select Account</InputLabel>
                    <Select
                      value={selectedAccount ?? ''}
                      label="Select Account"
                      onChange={e => {
                        const acct = parseInt(e.target.value, 10);
                        console.log('[FrameWelcome] onAccountChange called with:', acct);
                        onAccountChange(acct);
                      }}
                      startAdornment={<AccountCircle sx={{ mr: 1 }} />}
                      disabled={!selectedDrive}
                    >
                      {accounts.map(a => (
                        <MenuItem key={a.id} value={a.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                            {a.account}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* No Drive Links Alert */}
                  {driveLinks.length === 0 && (
                    <Alert
                      severity="info"
                      sx={{ mb: 3 }}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => router.push('/admin')}
                        >
                          Add Links
                        </Button>
                      }
                    >
                      No drive links available for QA. Add some drive links to get started.
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Button
                        component="a"
                        href={selectedDrive || '#'}
                        target="_blank"
                        rel="noopener"
                        variant="outlined"
                        fullWidth
                        startIcon={<CloudDownload />}
                        disabled={!selectedDrive}
                        sx={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {selectedDrive ? 'Open Selected Video' : 'Select a Video'}
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Add />}
                        onClick={() => router.push('/admin')}
                        sx={{
                          borderColor: 'rgba(48, 79, 254, 0.5)',
                          color: '#304ffe',
                          '&:hover': {
                            borderColor: '#304ffe',
                            backgroundColor: 'rgba(48, 79, 254, 0.1)'
                          }
                        }}
                      >
                        Add Drive Links
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrow />}
                        disabled={!canStart}
                        onClick={() => {
                          console.log('[FrameWelcome] Start QA with:', {
                            drive: selectedDrive,
                            account: selectedAccount
                          });
                          onStart(selectedDrive, selectedAccount);
                        }}
                        sx={{
                          background: canStart
                            ? 'linear-gradient(45deg, #304ffe, #5472ff)'
                            : 'rgba(100,100,100,0.5)'
                        }}
                      >
                        Start QA Review
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Decorative circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 200,
                    height: 200,
                    bgcolor: '#304ffe',
                    borderRadius: '50%',
                    opacity: 0.05
                  }}
                />
              </Card>
            </Slide>
          </Grid>

          {/* Reference Video (9:16 aspect ratio) */}
          <Grid item xs={12} lg={4}>
            <Slide direction="left" in timeout={800}>
              <Card
                sx={{
                  p: 3,
                  height: '100%',
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(48,79,254,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VideoLibrary sx={{ fontSize: 28, color: '#304ffe', mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Reference Video
                  </Typography>
                </Box>

                {embedSrc ? (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      aspectRatio: '9/16',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '2px solid rgba(48,79,254,0.3)'
                    }}
                  >
                    <Box
                      component="iframe"
                      src={embedSrc}
                      title="Reference Video"
                      width="100%"
                      height="100%"
                      sx={{ border: 0 }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 300,
                      aspectRatio: '9/16',
                      border: '2px dashed rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Preview sx={{ fontSize: 48 }} />
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: 'center' }}
                >
                  This plays the latest published reference video for the chosen account.
                </Typography>
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
