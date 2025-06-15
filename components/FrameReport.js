import React from 'react';
import {
  Box, Card, Typography, Grid,
  FormGroup, FormControlLabel,
  Checkbox, TextField, Button,
  Chip, Divider, Fade, Slide
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Assessment,
  Preview,
  Notes,
  CloudDownload
} from '@mui/icons-material';

// Convert Google Drive URL to embeddable format
function convertDriveUrlToEmbed(driveUrl) {
  if (!driveUrl) return null;

  try {
    // Extract file ID from Google Drive URL
    const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  } catch (e) {
    console.error('Error converting drive URL:', e);
  }

  return driveUrl; // Return original if conversion fails
}

export default function FrameReport({
  task, step1Results, step2Results, step3Results, finalNotes,
  onFinalNotesChange, onSubmit
}) {
  const mapLabels = (obj) =>
    Object.entries(obj.checks).map(([k,v]) => ({
      key: k,
      label: k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()),
      value: v
    }));

  const cols1 = mapLabels(step1Results);
  const cols2 = mapLabels(step2Results);
  const cols3 = mapLabels(step3Results);

  const totalChecks = cols1.length + cols2.length + cols3.length;
  const passedChecks = [...cols1, ...cols2, ...cols3].filter(c => c.value).length;
  const successRate = Math.round((passedChecks / totalChecks) * 100);

  return (
    <Fade in timeout={800}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            QA Report Summary
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Chip
              icon={<Assessment />}
              label={`${passedChecks}/${totalChecks} Checks Passed`}
              color={successRate >= 80 ? 'success' : successRate >= 60 ? 'warning' : 'error'}
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                px: 2,
                py: 1
              }}
            />
            <Chip
              label={`${successRate}% Success Rate`}
              variant="outlined"
              sx={{
                borderColor: successRate >= 80 ? '#4caf50' : successRate >= 60 ? '#ff9800' : '#f44336',
                color: successRate >= 80 ? '#4caf50' : successRate >= 60 ? '#ff9800' : '#f44336',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Results Summary */}
          <Grid item xs={12} lg={8}>
            <Slide direction="right" in timeout={600}>
              <Card
                sx={{
                  p: 4,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(48, 79, 254, 0.2)',
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Assessment sx={{ fontSize: 28, color: '#304ffe', mr: 2 }} />
                  <Typography variant="h5" fontWeight={600}>
                    Quality Assessment Results
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Step 1 Results */}
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2a2a2a, #3a3a3a)',
                        border: '1px solid rgba(48, 79, 254, 0.1)'
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#304ffe' }}>
                        Step 1: Audio & Speed
                      </Typography>
                      <FormGroup>
                        {cols1.map(c => (
                          <FormControlLabel
                            key={c.key}
                            control={
                              <Checkbox
                                checked={c.value}
                                disabled
                                icon={<Cancel sx={{ color: '#f44336' }} />}
                                checkedIcon={<CheckCircle sx={{ color: '#4caf50' }} />}
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                sx={{
                                  color: c.value ? '#4caf50' : '#f44336',
                                  fontWeight: c.value ? 600 : 400
                                }}
                              >
                                {c.label}
                              </Typography>
                            }
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </FormGroup>
                      {step1Results.comments && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(48, 79, 254, 0.05)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Comments:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {step1Results.comments}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Step 2 Results */}
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2a2a2a, #3a3a3a)',
                        border: '1px solid rgba(48, 79, 254, 0.1)'
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#7c4dff' }}>
                        Step 2: Captions & Title Cards
                      </Typography>
                      <FormGroup>
                        {cols2.map(c => (
                          <FormControlLabel
                            key={c.key}
                            control={
                              <Checkbox
                                checked={c.value}
                                disabled
                                icon={<Cancel sx={{ color: '#f44336' }} />}
                                checkedIcon={<CheckCircle sx={{ color: '#4caf50' }} />}
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                sx={{
                                  color: c.value ? '#4caf50' : '#f44336',
                                  fontWeight: c.value ? 600 : 400
                                }}
                              >
                                {c.label}
                              </Typography>
                            }
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </FormGroup>
                      {step2Results.comments && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(124, 77, 255, 0.05)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Comments:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {step2Results.comments}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Step 3 Results */}
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2a2a2a, #3a3a3a)',
                        border: '1px solid rgba(48, 79, 254, 0.1)'
                      }}
                    >
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#ff9800' }}>
                        Step 3: Background & Music
                      </Typography>
                      <FormGroup>
                        {cols3.map(c => (
                          <FormControlLabel
                            key={c.key}
                            control={
                              <Checkbox
                                checked={c.value}
                                disabled
                                icon={<Cancel sx={{ color: '#f44336' }} />}
                                checkedIcon={<CheckCircle sx={{ color: '#4caf50' }} />}
                              />
                            }
                            label={
                              <Typography
                                variant="body2"
                                sx={{
                                  color: c.value ? '#4caf50' : '#f44336',
                                  fontWeight: c.value ? 600 : 400
                                }}
                              >
                                {c.label}
                              </Typography>
                            }
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </FormGroup>
                      {step3Results.comments && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                          <Typography variant="caption" color="text.secondary">
                            Comments:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {step3Results.comments}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: 'rgba(48, 79, 254, 0.2)' }} />

                {/* Final Notes */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notes sx={{ fontSize: 24, color: '#304ffe', mr: 2 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Final Notes & Recommendations
                  </Typography>
                </Box>

                <TextField
                  label="Final Notes & Step 3 Comments"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={finalNotes}
                  onChange={e => onFinalNotesChange(e.target.value)}
                  placeholder="Add any final observations, recommendations, or notes about this QA review..."
                  helperText="This includes your Step 3 comments and any additional final notes"
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => onSubmit('approved')}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                      boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c, #4caf50)',
                        boxShadow: '0 12px 40px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Cancel />}
                    onClick={() => onSubmit('rejected')}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #f44336, #ef5350)',
                      boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                        boxShadow: '0 12px 40px rgba(244, 67, 54, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Reject
                  </Button>
                </Box>

                {/* Download Report Button - At the very end */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CloudDownload />}
                    onClick={() => {
                      const downloadUrl = `/api/qa/download-report?qa_task_id=${task.qa_task_id}`;
                      window.open(downloadUrl, '_blank');
                    }}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: 'rgba(48, 79, 254, 0.5)',
                      color: '#304ffe',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#304ffe',
                        backgroundColor: 'rgba(48, 79, 254, 0.1)',
                        boxShadow: '0 4px 20px rgba(48, 79, 254, 0.2)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Download QA Report
                  </Button>
                </Box>
              </Card>
            </Slide>
          </Grid>

          {/* Preview Section */}
          <Grid item xs={12} lg={4}>
            <Slide direction="left" in timeout={800}>
              <Card
                sx={{
                  p: 3,
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                  border: '1px solid rgba(48, 79, 254, 0.2)',
                  height: 'fit-content'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Preview sx={{ fontSize: 24, color: '#304ffe', mr: 2 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Final Preview
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '9/16',
                    borderRadius: 2,
                    border: '2px solid rgba(48, 79, 254, 0.3)',
                    overflow: 'hidden',
                    position: 'relative',
                    mb: 2
                  }}
                >
                  {task.drive_url ? (
                    <Box
                      component="iframe"
                      src={convertDriveUrlToEmbed(task.drive_url)}
                      title="QA Video Preview"
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: 0
                      }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'text.secondary'
                      }}
                    >
                      <Preview sx={{ fontSize: 48 }} />
                    </Box>
                  )}
                  <Chip
                    label={successRate >= 80 ? 'Approved' : 'Needs Review'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: successRate >= 80
                        ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                        : 'linear-gradient(45deg, #ff9800, #ffb74d)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {task.title || task.script_title || `QA Task #${task.qa_task_id}`}
                </Typography>

                {task.drive_url && (
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(task.drive_url, '_blank')}
                      sx={{
                        fontSize: '0.75rem',
                        py: 0.5,
                        px: 1,
                        borderColor: 'rgba(48, 79, 254, 0.3)',
                        color: '#304ffe',
                        '&:hover': {
                          borderColor: '#304ffe',
                          backgroundColor: 'rgba(48, 79, 254, 0.1)'
                        }
                      }}
                    >
                      Open Full Video
                    </Button>
                  </Box>
                )}
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}

