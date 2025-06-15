// components/DriveLinksManager.js
import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, TextField, Button, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Add, Delete, Edit, Link as LinkIcon, CloudDownload, 
  CheckCircle, Schedule, Error as ErrorIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function DriveLinksManager({ showWelcomeMessage = true }) {
  const [driveLinks, setDriveLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, link: null });

  // Load existing drive links
  useEffect(() => {
    loadDriveLinks();
  }, []);

  const loadDriveLinks = async () => {
    try {
      console.log('[DriveLinksManager] Loading drive links...');
      const response = await axios.get('/api/drive-links');
      console.log('[DriveLinksManager] API response:', response.data);

      const links = response.data.driveLinks || [];
      console.log('[DriveLinksManager] Setting links:', links);
      setDriveLinks(links);
    } catch (err) {
      setError('Failed to load drive links');
      console.error('[DriveLinksManager] Load drive links error:', err);
    }
  };

  // Extract file ID from Google Drive/Docs URL
  const extractFileId = (url) => {
    // Handle Google Drive files: /file/d/FILE_ID
    let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    // Handle Google Docs: /document/d/FILE_ID
    match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    // Handle Google Sheets: /spreadsheets/d/FILE_ID
    match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    // Handle Google Slides: /presentation/d/FILE_ID
    match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];

    return null;
  };

  // Detect the type of Google Drive content
  const getContentType = (url) => {
    if (url.includes('/file/d/')) return 'file';
    if (url.includes('/document/d/')) return 'document';
    if (url.includes('/spreadsheets/d/')) return 'spreadsheet';
    if (url.includes('/presentation/d/')) return 'presentation';
    return 'unknown';
  };

  // Validate Google Drive/Docs URL
  const isValidDriveUrl = (url) => {
    return (url.includes('drive.google.com') || url.includes('docs.google.com')) && extractFileId(url);
  };

  // Add new drive link
  const addDriveLink = async () => {
    if (!newLink.trim()) {
      setError('Please enter a drive link');
      return;
    }

    if (!isValidDriveUrl(newLink)) {
      setError('Please enter a valid Google Drive/Docs share link (supports files, documents, sheets, and presentations)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('[DriveLinksManager] Adding drive link:', newLink.trim());
      const response = await axios.post('/api/add-drive-link', {
        url: newLink.trim()
      });

      console.log('[DriveLinksManager] Add response:', response.data);

      if (response.data.success) {
        setSuccess('Drive link added successfully!');
        setNewLink('');
        console.log('[DriveLinksManager] Reloading drive links...');
        await loadDriveLinks(); // Wait for reload to complete
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to add drive link');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add drive link');
      console.error('[DriveLinksManager] Add drive link error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete drive link
  const deleteDriveLink = async (id) => {
    if (!confirm('Are you sure you want to delete this drive link?')) return;

    try {
      await axios.delete(`/api/drive-links/${id}`);
      setSuccess('Drive link deleted successfully!');
      loadDriveLinks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete drive link');
    }
  };

  // Update drive link status
  const updateLinkStatus = async (id, status) => {
    try {
      await axios.patch(`/api/drive-links/${id}`, { status });
      loadDriveLinks();
    } catch (err) {
      setError('Failed to update link status');
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'in_progress': return <Schedule />;
      case 'completed': return <CheckCircle />;
      case 'rejected': return <ErrorIcon />;
      default: return <Schedule />;
    }
  };

  const getContentTypeIcon = (url) => {
    const type = getContentType(url);
    switch (type) {
      case 'document': return '📄';
      case 'spreadsheet': return '📊';
      case 'presentation': return '📽️';
      case 'file': return '🎥';
      default: return '📁';
    }
  };

  const getContentTypeLabel = (url) => {
    const type = getContentType(url);
    switch (type) {
      case 'document': return 'Google Doc';
      case 'spreadsheet': return 'Google Sheet';
      case 'presentation': return 'Google Slides';
      case 'file': return 'Drive File';
      default: return 'Unknown';
    }
  };

  return (
    <Box>
      {showWelcomeMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight={600}>
            Welcome to Drive Links Manager!
          </Typography>
          <Typography variant="body2">
            Add Google Drive video links here that need to be QA'd. These links will appear in the QA dashboard dropdown for reviewers to select.
          </Typography>
        </Alert>
      )}

      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        Drive Links Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Add New Link */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add New Content for QA
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Google Drive/Docs Share Link"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/... or https://docs.google.com/document/d/..."
            helperText="Paste any Google Drive file, Google Doc, Sheet, or Slides link that needs QA"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={addDriveLink}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            Add Link
          </Button>
        </Box>
      </Card>

      {/* Links List */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Drive Links Queue ({driveLinks.length})
        </Typography>
        
        {driveLinks.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No drive links added yet. Add some links above to get started.
          </Typography>
        ) : (
          <List>
            {driveLinks.map((link) => (
              <ListItem
                key={link.id}
                sx={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'rgba(48,79,254,0.05)'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ fontSize: '16px' }}>{getContentTypeIcon(link.full_url)}</span>
                        <Typography variant="body1" fontWeight={500}>
                          {link.file_id}
                        </Typography>
                      </Box>
                      <Chip
                        label={getContentTypeLabel(link.full_url)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          borderColor: 'rgba(48,79,254,0.3)',
                          color: '#304ffe'
                        }}
                      />
                      {link.status && (
                        <Chip
                          icon={getStatusIcon(link.status)}
                          label={link.status || 'pending'}
                          color={getStatusColor(link.status)}
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Added: {new Date(link.created_at).toLocaleDateString()}
                      </Typography>
                      <br />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          wordBreak: 'break-all',
                          color: 'text.secondary'
                        }}
                      >
                        {link.full_url}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => window.open(link.full_url, '_blank')}
                      title="Open in Drive"
                    >
                      <CloudDownload />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setEditDialog({ open: true, link })}
                      title="Edit Status"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteDriveLink(link.id)}
                      title="Delete"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, link: null })}>
        <DialogTitle>Update Link Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={editDialog.link?.status || 'pending'}
              label="Status"
              onChange={(e) => setEditDialog({
                ...editDialog,
                link: { ...editDialog.link, status: e.target.value }
              })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, link: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              updateLinkStatus(editDialog.link.id, editDialog.link.status);
              setEditDialog({ open: false, link: null });
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
