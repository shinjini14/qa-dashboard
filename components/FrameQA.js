// components/FrameQA.js
import React, { useState } from 'react';
import {
  Box, Card, Typography, Grid,
  FormGroup, FormControlLabel,
  Checkbox, TextField, Button,
  Chip, LinearProgress, Fade, Slide
} from '@mui/material';
import {
  CheckCircle, RadioButtonUnchecked,
  ArrowForward, VideoLibrary,
  Description, OpenInNew,
  Assignment, Preview
} from '@mui/icons-material';
import axios from 'axios';

// turn any YouTube watch/shorts URL into an embed-friendly URL
function toEmbedUrl(watchUrl) {
  try {
    const m = watchUrl.match(/(?:youtu\.be\/|v=|shorts\/)([^?&/]+)/);
    if (m && m[1]) {
      const id = m[1];
      return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return watchUrl;
}

// Convert Google Drive share URL to different formats for video playback
function convertDriveUrl(driveUrl) {
  if (!driveUrl) return null;
  try {
    const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      return {
        preview: `https://drive.google.com/file/d/${fileId}/preview`,
        direct: `https://drive.google.com/uc?export=download&id=${fileId}`,
        embed: `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`,
        original: driveUrl
      };
    }
  } catch (e) {
    console.error('Error converting drive URL:', e);
  }
  return { original: driveUrl };
}

export default function FrameQA({ step, task, onNext }) {
  // QA checklist templates
  const templates = {
    1: [
      { key:'correctTitleCardAccount',   label:'Correct title card account' },
      { key:'correctBeginningAnimation', label:'Correct beginning animation' },
      { key:'correctEndingAnimation',    label:'Correct ending animation' },
      { key:'correctBackgroundFootage',  label:'Correct background footage' },
      { key:'audioQuality',              label:'Audio quality is clear' },
      { key:'videoQuality',              label:'Video quality is acceptable' },
    ],
    2: [
      { key:'correctFont',               label:'Correct Font' },
      { key:'correctCaptionAnimation',   label:'Correct caption animation' },
      { key:'correctEndingAnimation2',   label:'Correct ending animation' },
      { key:'correctBackgroundFootage2', label:'Correct background footage' },
      { key:'textReadability',           label:'Text is readable and clear' },
      { key:'overallQuality',            label:'Overall video meets standards' },
    ]
  };

  const initChecks = {};
  templates[step].forEach(i => initChecks[i.key] = false);
  const [checks, setChecks]     = useState(initChecks);
  const [comments, setComments] = useState('');
  const [referenceVideo, setReferenceVideo] = useState(null);

  // Get reference video from localStorage on component mount
  React.useEffect(() => {
    try {
      const storedReference = localStorage.getItem('qa_reference_video');
      if (storedReference) {
        const referenceData = JSON.parse(storedReference);
        setReferenceVideo(referenceData);
        console.log('[FrameQA] loaded reference video from localStorage:', referenceData);
      }
    } catch (error) {
      console.error('[FrameQA] error loading reference video from localStorage:', error);
    }
  }, []);

  // Save checklist item to database when toggled
  const toggle = async (key) => {
    const newChecks = { ...checks, [key]: !checks[key] };
    setChecks(newChecks);

    // Save to database immediately
    try {
      await axios.post('/api/qa/submit-step', {
        qa_task_id: task.qa_task_id,
        frame: step,
        checks: newChecks,
        comments: comments
      });
      console.log(`[FrameQA] Saved step ${step} progress:`, { key, checked: newChecks[key] });
    } catch (error) {
      console.error(`[FrameQA] Failed to save step ${step} progress:`, error);
    }
  };

  const doneCount  = Object.values(checks).filter(Boolean).length;
  const totalCount = templates[step].length;
  const progress   = (doneCount / totalCount) * 100;

  // Reference video from localStorage (same as shown in FrameWelcome)
  const refEmbed = referenceVideo?.embed_url || null;
  const refUrl = referenceVideo?.video_url || null;

  // Drive video from the selected drive link (converted for direct playback)
  const driveUrls = convertDriveUrl(task.drive_url);
  const [videoError, setVideoError] = useState(false);

  // Debug logging
  console.log('[FrameQA] Original drive URL:', task.drive_url);
  console.log('[FrameQA] Converted drive URLs:', driveUrls);
  console.log('[FrameQA] Reference video:', referenceVideo);

  return (
    <Fade in timeout={800}>
      <Box>
        {/* HEADER */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            QA Review — Step {step}
          </Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<Assignment />}
              label={`${doneCount}/${totalCount} Completed`}
              color={doneCount === totalCount ? 'success' : 'default'}
              sx={{
                fontWeight: 600,
                ...(doneCount === totalCount && {
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  color: 'white'
                })
              }}
            />
            <Box sx={{ width: 200 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(48,79,254,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(45deg, #304ffe, #7c4dff)',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* REFERENCE VIDEO */}
          <Grid item xs={12} lg={4}>
            <Slide direction="right" in timeout={600}>
              <Card sx={{
                p:1.5, height:'100%', // Reduced padding for more video space
                background:'linear-gradient(145deg,#1a1a1a,#2a2a2a)',
                border:'1px solid rgba(48,79,254,0.2)'
              }}>
                <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
                  <VideoLibrary sx={{ fontSize:24, color:'#304ffe', mr:1 }}/>
                  <Typography variant="h6" fontWeight={600}>
                    Reference Video
                  </Typography>
                </Box>
                {refEmbed ? (
                  <Box sx={{
                    width:'100%',
                    height:'calc(100vh - 300px)', // Use more of the viewport height
                    minHeight: 400, // Minimum height
                    borderRadius:2,
                    overflow:'hidden',
                    border:'2px solid rgba(48,79,254,0.3)'
                  }}>
                    <Box
                      component="iframe"
                      src={refEmbed}
                      title="Reference"
                      width="100%"
                      height="100%"
                      sx={{
                        border:0,
                        display: 'block' // Remove any default margins
                      }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Box sx={{
                    width:'100%',
                    height:'calc(100vh - 300px)', // Match video height
                    minHeight: 400, // Minimum height
                    border:'2px dashed rgba(255,255,255,0.2)',
                    borderRadius:2,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'text.secondary'
                  }}>
                    <Preview sx={{ fontSize:48 }}/>
                  </Box>
                )}
                <Button
                  startIcon={<OpenInNew />}
                  sx={{ mt:2, textTransform:'none' }}
                  onClick={()=>window.open(refUrl,'_blank')}
                  disabled={!refUrl}
                >
                  Open Reference
                </Button>
              </Card>
            </Slide>
          </Grid>

          {/* DRIVE VIDEO TO QA */}
          <Grid item xs={12} lg={4}>
            <Slide direction="up" in timeout={800}>
              <Card sx={{
                p:1.5, height:'100%', // Reduced padding for more video space
                background:'linear-gradient(145deg,#1a1a1a,#2a2a2a)',
                border:'1px solid rgba(48,79,254,0.2)'
              }}>
                <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
                  <Description sx={{ fontSize:24, color:'#304ffe', mr:1 }}/>
                  <Typography variant="h6" fontWeight={600}>
                    QA Preview
                  </Typography>
                </Box>
                {driveUrls?.preview ? (
                  <Box sx={{
                    width:'100%',
                    height:'calc(100vh - 300px)', // Use more of the viewport height
                    minHeight: 400, // Minimum height
                    borderRadius:2,
                    overflow:'hidden',
                    position:'relative',
                    border:'2px solid rgba(48,79,254,0.3)'
                  }}>
                    <Box
                      component="iframe"
                      src={driveUrls.embed}
                      title="QA Video"
                      width="100%"
                      height="100%"
                      sx={{
                        border:0,
                        display: 'block' // Remove any default margins
                      }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      onError={() => {
                        console.log('[FrameQA] Iframe failed, trying direct video');
                        setVideoError(true);
                      }}
                    />
                    {!videoError && (
                      <Chip
                        label="QA Video"
                        size="small"
                        sx={{
                          position:'absolute', top:12, right:12,
                          background:'linear-gradient(45deg,#ff5722,#ff7043)',
                          color:'white', fontWeight:600
                        }}
                      />
                    )}
                    {videoError && (
                      <Box sx={{
                        position:'absolute', top:0, left:0, right:0, bottom:0,
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        backgroundColor:'rgba(0,0,0,0.8)', color:'white'
                      }}>
                        <Typography variant="body2" sx={{ mb:2, textAlign:'center' }}>
                          Video preview not available.<br/>
                          Click "Open Drive Video" to view in new tab.
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={()=>window.open(task.drive_url,'_blank')}
                          sx={{ background:'linear-gradient(45deg,#304ffe,#7c4dff)' }}
                        >
                          Open Drive Video
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{
                    width:'100%',
                    height:'calc(100vh - 300px)', // Match video height
                    minHeight: 400, // Minimum height
                    border:'2px dashed rgba(255,255,255,0.2)',
                    borderRadius:2,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'text.secondary'
                  }}>
                    <CloudDownload sx={{ fontSize:48 }}/>
                  </Box>
                )}
                <Button
                  startIcon={<OpenInNew />}
                  sx={{ mt:2, textTransform:'none' }}
                  onClick={()=>window.open(task.drive_url,'_blank')}
                  disabled={!task.drive_url}
                >
                  Open Drive Video
                </Button>
              </Card>
            </Slide>
          </Grid>

          {/* CHECKLIST */}
          <Grid item xs={12} lg={4}>
            <Slide direction="left" in timeout={1000}>
              <Card sx={{
                p:3, height:'100%',
                background:'linear-gradient(145deg,#1a1a1a,#2a2a2a)',
                border:'1px solid rgba(48,79,254,0.2)'
              }}>
                <Box sx={{ display:'flex', alignItems:'center', mb:3 }}>
                  <Assignment sx={{ fontSize:24, color:'#304ffe', mr:1 }}/>
                  <Typography variant="h6" fontWeight={600}>
                    Quality Checklist
                  </Typography>
                </Box>
                <FormGroup sx={{ mb:3 }}>
                  {templates[step].map(item => (
                    <FormControlLabel
                      key={item.key}
                      control={
                        <Checkbox
                          checked={checks[item.key]}
                          onChange={()=>toggle(item.key)}
                          icon={<RadioButtonUnchecked />}
                          checkedIcon={<CheckCircle />}
                          sx={{ color:'rgba(48,79,254,0.5)', '&.Mui-checked':{ color:'#4caf50' } }}
                        />
                      }
                      label={<Typography sx={{fontWeight:checks[item.key]?600:400}}>
                        {item.label}
                      </Typography>}
                      sx={{
                        mb:1, p:1, borderRadius:1,
                        '&:hover':{ backgroundColor:'rgba(48,79,254,0.05)' }
                      }}
                    />
                  ))}
                </FormGroup>
                <TextField
                  label="Additional Comments"
                  multiline rows={4} fullWidth variant="outlined"
                  value={comments}
                  onChange={async (e) => {
                    const newComments = e.target.value;
                    setComments(newComments);

                    // Auto-save comments to database
                    try {
                      await axios.post('/api/qa/submit-step', {
                        qa_task_id: task.qa_task_id,
                        frame: step,
                        checks: checks,
                        comments: newComments
                      });
                      console.log(`[FrameQA] Saved step ${step} comments`);
                    } catch (error) {
                      console.error(`[FrameQA] Failed to save step ${step} comments:`, error);
                    }
                  }}
                  sx={{
                    mb:3,
                    '& .MuiOutlinedInput-root':{
                      borderRadius:1,
                      '&:hover':{ boxShadow:'0 4px 20px rgba(48,79,254,0.2)' }
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={()=>onNext(checks,comments)}
                    sx={{
                      py:1.5, borderRadius:1, fontWeight:600,
                      background:'linear-gradient(45deg,#304ffe,#7c4dff)',
                      '&:hover':{ background:'linear-gradient(45deg,#1e3aff,#6c3dff)' }
                    }}
                  >
                    {step===1? 'Continue to Step 2' : 'Complete Review'}
                  </Button>
                </Box>
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
