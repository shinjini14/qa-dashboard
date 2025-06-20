// components/FrameQA.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Fade,
  Slide,
} from "@mui/material";
import {
  CheckCircle,
  RadioButtonUnchecked,
  ArrowForward,
  VideoLibrary,
  Description,
  OpenInNew,
  Assignment,
  Preview,
  ArrowBack,
} from "@mui/icons-material";
import axios from "axios";

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
        original: driveUrl,
      };
    }
  } catch (e) {
    console.error("Error converting drive URL:", e);
  }
  return { original: driveUrl };
}

export default function FrameQA({ step, task, onNext, onPrevious }) {
  const [qaConfig, setQaConfig] = useState({});

  // Load QA configuration from environment variables
  useEffect(() => {
    const loadQaConfig = async () => {
      try {
        const response = await axios.get("/api/qa-config");
        if (response.data.success) {
          setQaConfig(response.data.config);
          console.log("[FrameQA] Loaded QA config:", response.data.config);
        }
      } catch (error) {
        console.error("[FrameQA] Failed to load QA config:", error);
      }
    };
    loadQaConfig();
  }, []);

  // QA checklist templates - REQUESTEDREADS YT SHORT FORM PROCESS (3 Steps)
  const templates = {
    1: [
      // Audio generation using elevenlabs
      {
        key: "audioMaleAntoni",
        label: "Male Antoni",
        group: "Audio generation using elevenlabs",
      },
      {
        key: "audioFemaleNatasha",
        label: "Female Natasha Valley Girl",
        group: "Audio generation using elevenlabs",
      },

      // Elevenlabs Settings
      {
        key: "elevenSpeed12x",
        label: "1.2x Speed",
        group: "Elevenlabs Settings",
      },
      {
        key: "elevenStability100",
        label: "100% Stability",
        group: "Elevenlabs Settings",
      },
      {
        key: "elevenSimilarity80",
        label: "80% Similarity",
        group: "Elevenlabs Settings",
      },

      // Audacity Settings
      {
        key: "audacityThreshold30",
        label: "Threshold -30",
        group: "Audacity Settings",
      },
      {
        key: "audacityDuration01",
        label: "Duration 0.1",
        group: "Audacity Settings",
      },
      {
        key: "audacityTruncated01",
        label: "Truncated 0.1",
        group: "Audacity Settings",
      },

      // Adobe Speed Settings
      { key: "adobeSpeed110", label: "110%", group: "Adobe Speed Settings" },
    ],
    2: [
      // Quality Check Questions
      {
        key: "currentBeaconsTitleCard",
        label: "Does this have the current Beacons Title Card?",
        group: "Quality Check Questions",
      },
      {
        key: "correctTitleCardPosition",
        label: "Does this title card have the correct positioning?",
        group: "Quality Check Questions",
      },
      {
        key: "sameBeginningAnimation",
        label: "Does this title card have the same beginning Animation?",
        group: "Quality Check Questions",
      },
      {
        key: "sameEndAnimation",
        label: "Does this title card have the same end Animation?",
        group: "Quality Check Questions",
      },
      {
        key: "sameCaptionAnimation",
        label: "Does this have the same Caption Animation",
        group: "Quality Check Questions",
      },
      {
        key: "correctCaptionSettings",
        label: "Does this have correct caption settings?",
        group: "Quality Check Questions",
      },

      // This is only for short form Additional Process
      {
        key: "lastSentenceYellow",
        label:
          'Last sentence should be yellow especially if the sentence is "Full story is linked below"',
        group: "This is only for short form Additional Process",
      },
      {
        key: "redArrowCapcut",
        label: "Add red arrow on it using capcut",
        group: "This is only for short form Additional Process",
      },
    ],
    3: [
      // Background Quality Checks
      {
        key: "correctBackground",
        label: "Does this have the correct background?",
        group: "Background Quality Checks",
      },
      {
        key: "videoEndCorrectPlace",
        label: "Does the video end at the correct place?",
        group: "Background Quality Checks",
      },

      // Add background music to it
      {
        key: "backgroundMusicAdded",
        label:
          "Open this document to know the process 📄 How to add music to videos",
        group: "Add background music to it",
        link: qaConfig.musicProcessDocUrl,
      },
    ],

   4: [
  // QA Errors: Font/Caption
 
  { key: "fontWrongSize", label: "Size", group: "Font/Caption Error: Wrong - Font" },
  { key: "fontWrongPosition", label: "Position", group: "Font/Caption Error: Wrong - Font" },
  { key: "fontWrongStroke", label: "Stroke", group: "Font/Caption Error: Wrong - Font" },

  // QA Errors: Title Card
  
  { key: "titleWrongEdges", label: "Edges", group: "Title Card Error: Wrong - Title Card used" },
  { key: "titleWrongPlacement", label: "Placement", group: "Title Card Error: Wrong - Title Card used" },
  { key: "titleWrongAnimation", label: "Animation", group: "Title Card Error: Wrong - Title Card used" },
  { key: "titleWrongColor", label: "Color", group: "Title Card Error: Wrong - Title Card used" },
  { key: "titleMissing", label: "No Title Card Present", group: "Title Card Error: Wrong - Title Card used" },

  // Dimension Error
  { key: "dimensionIncorrect", label: "Not 1080x1920 Resolution", group: "Dimension Error" },

  // Video Length Error
  { key: "lengthExceeded", label: "Video exceeds 2:58 mins (Shortforms)", group: "Video Length Error" }
],

5: [
  // Music Background Errors
  { key: "bgMusicMissingOver60s", label: "Missing BG Music for videos over 60s (Shortforms)", group: "Music Background Errors" },
  { key: "bgMusicPresentUnder60s", label: "Has BG Music but under 60s (Shortforms)", group: "Music Background Errors" },
  { key: "bgMusicWrongLongform", label: "Wrong BG Music on Longform", group: "Music Background Errors" },

  // Additional Issues: Video Glitches
  { key: "glitchBlackVideo", label: "Glitch: Black/Blank Video", group: "Video Glitches" },
  { key: "glitchStaticBlurred", label: "Glitch: Static/Blurred Video", group: "Video Glitches" },

  // Additional Issues: VO Glitches
  { key: "glitchUnwantedVO", label: "VO Glitch: Unwanted Noises", group: "VO Glitches" },

  // Additional Issues: Video Issues
  { key: "issueDoubleLiners", label: "Double Liners (Shortforms)", group: "Video Issues" },
  { key: "issueCaptionMisaligned", label: "Captions Not Aligned (Shortforms)", group: "Video Issues" },
  { key: "issueCutOffEnd", label: "Video Cut Off at End", group: "Video Issues" },
  { key: "issueOverlap", label: "Title Card / Caption Overlap", group: "Video Issues" }
],

  };

  const initChecks = {};
  templates[step].forEach((i) => (initChecks[i.key] = false));
  const [checks, setChecks] = useState(initChecks);
  const [comments, setComments] = useState("");
  const [referenceVideo, setReferenceVideo] = useState(null);

  // Get reference video from localStorage on component mount
  React.useEffect(() => {
    try {
      const storedReference = localStorage.getItem("qa_reference_video");
      if (storedReference) {
        const referenceData = JSON.parse(storedReference);
        setReferenceVideo(referenceData);
        console.log(
          "[FrameQA] loaded reference video from localStorage:",
          referenceData
        );
      }
    } catch (error) {
      console.error(
        "[FrameQA] error loading reference video from localStorage:",
        error
      );
    }
  }, []);

  // Save checklist item to database when toggled
  const toggle = async (key) => {
    const newChecks = { ...checks, [key]: !checks[key] };
    setChecks(newChecks);

    // Save to database immediately
    try {
      await axios.post("/api/qa/submit-step", {
        qa_task_id: task.qa_task_id,
        frame: step,
        checks: newChecks,
        comments: comments,
      });
      console.log(`[FrameQA] Saved step ${step} progress:`, {
        key,
        checked: newChecks[key],
      });
    } catch (error) {
      console.error(`[FrameQA] Failed to save step ${step} progress:`, error);
    }
  };

  const doneCount = Object.values(checks).filter(Boolean).length;
  const totalCount = templates[step].length;
  const progress = (doneCount / totalCount) * 100;

  // Reference video from localStorage (same as shown in FrameWelcome)
  const refEmbed = referenceVideo?.embed_url || null;
  const refUrl = referenceVideo?.video_url || null;

  // Drive video from the selected drive link (converted for direct playback)
  const driveUrls = convertDriveUrl(task.drive_url);
  const [videoError, setVideoError] = useState(false);

  // Debug logging
  console.log("[FrameQA] Original drive URL:", task.drive_url);
  console.log("[FrameQA] Converted drive URLs:", driveUrls);
  console.log("[FrameQA] Reference video:", referenceVideo);

  return (
    <Fade in timeout={800}>
      <Box>
        {/* HEADER */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #304ffe, #7c4dff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            QA Review — Step {step}
          </Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<Assignment />}
              label={`${doneCount}/${totalCount} Completed`}
              color={doneCount === totalCount ? "success" : "default"}
              sx={{
                fontWeight: 600,
                ...(doneCount === totalCount && {
                  background: "linear-gradient(45deg, #4caf50, #66bb6a)",
                  color: "white",
                }),
              }}
            />
            <Box sx={{ width: 200 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(48,79,254,0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(45deg, #304ffe, #7c4dff)",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* REFERENCE VIDEO */}
          <Grid item xs={12} lg={4}>
            <Slide direction="right" in timeout={600}>
              <Card
                sx={{
                  p: 1.5,
                  height: "100%", // Reduced padding for more video space
                  background: "linear-gradient(145deg,#1a1a1a,#2a2a2a)",
                  border: "1px solid rgba(48,79,254,0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <VideoLibrary
                    sx={{ fontSize: 24, color: "#304ffe", mr: 1 }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Reference Video
                  </Typography>
                </Box>
                {refEmbed ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 250px)", // Taller video container
                      minHeight: 500, // Increased minimum height
                      maxHeight: 800, // Maximum height to prevent too tall
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "2px solid rgba(48,79,254,0.3)",
                      position: "relative",
                    }}
                  >
                    <Box
                      component="iframe"
                      src={refEmbed}
                      title="Reference"
                      width="100%"
                      height="100%"
                      sx={{
                        border: 0,
                        display: "block",
                        objectFit: "cover", // Ensure video fills container
                      }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                    <Chip
                      label="Reference"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "linear-gradient(45deg,#304ffe,#7c4dff)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 250px)", // Match video height
                      minHeight: 500, // Increased minimum height
                      maxHeight: 800, // Maximum height
                      border: "2px dashed rgba(255,255,255,0.2)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Preview sx={{ fontSize: 48 }} />
                  </Box>
                )}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    startIcon={<OpenInNew />}
                    sx={{ textTransform: "none", flex: 1 }}
                    onClick={() => window.open(refUrl, "_blank")}
                    disabled={!refUrl}
                  >
                    Open Reference
                  </Button>
                </Box>
              </Card>
            </Slide>
          </Grid>

          {/* DRIVE VIDEO TO QA */}
          <Grid item xs={12} lg={4}>
            <Slide direction="up" in timeout={800}>
              <Card
                sx={{
                  p: 1.5,
                  height: "100%", // Reduced padding for more video space
                  background: "linear-gradient(145deg,#1a1a1a,#2a2a2a)",
                  border: "1px solid rgba(48,79,254,0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Description sx={{ fontSize: 24, color: "#304ffe", mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    QA Preview
                  </Typography>
                </Box>
                {driveUrls?.preview ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 250px)", // Taller video container
                      minHeight: 500, // Increased minimum height
                      maxHeight: 800, // Maximum height to prevent too tall
                      borderRadius: 2,
                      overflow: "hidden",
                      position: "relative",
                      border: "2px solid rgba(48,79,254,0.3)",
                    }}
                  >
                    <Box
                      component="iframe"
                      src={driveUrls.embed}
                      title="QA Video"
                      width="100%"
                      height="100%"
                      sx={{
                        border: 0,
                        display: "block",
                        objectFit: "cover", // Ensure video fills container
                      }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      onError={() => {
                        console.log(
                          "[FrameQA] Iframe failed, trying direct video"
                        );
                        setVideoError(true);
                      }}
                    />
                    {!videoError && (
                      <Chip
                        label="QA Video"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "linear-gradient(45deg,#ff5722,#ff7043)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    )}
                    {videoError && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.8)",
                          color: "white",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ mb: 2, textAlign: "center" }}
                        >
                          Video preview not available.
                          <br />
                          Click "Open Drive Video" to view in new tab.
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => window.open(task.drive_url, "_blank")}
                          sx={{
                            background:
                              "linear-gradient(45deg,#304ffe,#7c4dff)",
                          }}
                        >
                          Open Drive Video
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 250px)", // Match video height
                      minHeight: 500, // Increased minimum height
                      maxHeight: 800, // Maximum height
                      border: "2px dashed rgba(255,255,255,0.2)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                    }}
                  >
                    <CloudDownload sx={{ fontSize: 48 }} />
                  </Box>
                )}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    startIcon={<OpenInNew />}
                    sx={{ textTransform: "none", flex: 1 }}
                    onClick={() => window.open(task.drive_url, "_blank")}
                    disabled={!task.drive_url}
                  >
                    Open Drive Video
                  </Button>
                </Box>
              </Card>
            </Slide>
          </Grid>

          {/* CHECKLIST */}
          <Grid item xs={12} lg={4}>
            <Slide direction="left" in timeout={1000}>
              <Card
                sx={{
                  p: 3,
                  height: "100%",
                  background: "linear-gradient(145deg,#1a1a1a,#2a2a2a)",
                  border: "1px solid rgba(48,79,254,0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Assignment sx={{ fontSize: 24, color: "#304ffe", mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {step === 1
                      ? "Step 1: Audio & Speed Settings"
                      : step === 2
                      ? "Step 2: Captions & Title Cards"
                      : step === 3
                      ? "Step 3: Background & Music"
                      : step === 4
                      ? "Step 4: Visual & Timing Errors"
                      : "Step 5: Audio & Misc. Glitches"}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  {(() => {
                    // Group items by their group property
                    const grouped = {};
                    templates[step].forEach((item) => {
                      const group = item.group || "General";
                      if (!grouped[group]) grouped[group] = [];
                      grouped[group].push(item);
                    });

                    return Object.entries(grouped).map(([groupName, items]) => (
                      <Box key={groupName} sx={{ mb: 3 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            mb: 1.5,
                            color: "#304ffe",
                            borderBottom: "2px solid rgba(48,79,254,0.3)",
                            pb: 0.5,
                          }}
                        >
                          {groupName}
                        </Typography>
                        <FormGroup>
                          {items.map((item) => (
                            <FormControlLabel
                              key={item.key}
                              control={
                                <Checkbox
                                  checked={checks[item.key]}
                                  onChange={() => toggle(item.key)}
                                  icon={<RadioButtonUnchecked />}
                                  checkedIcon={<CheckCircle />}
                                  sx={{
                                    color: "rgba(48,79,254,0.5)",
                                    "&.Mui-checked": { color: "#4caf50" },
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: checks[item.key] ? 600 : 400,
                                    }}
                                  >
                                    {item.label}
                                  </Typography>
                                  {item.link && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        window.open(item.link, "_blank")
                                      }
                                      sx={{
                                        minWidth: "auto",
                                        px: 1,
                                        py: 0.25,
                                        fontSize: "0.7rem",
                                        borderColor: "#304ffe",
                                        color: "#304ffe",
                                        "&:hover": {
                                          backgroundColor:
                                            "rgba(48,79,254,0.1)",
                                          borderColor: "#304ffe",
                                        },
                                      }}
                                    >
                                      Link
                                    </Button>
                                  )}
                                </Box>
                              }
                              sx={{
                                mb: 0.5,
                                p: 1,
                                borderRadius: 1,
                                "&:hover": {
                                  backgroundColor: "rgba(48,79,254,0.05)",
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    ));
                  })()}
                </Box>
                <TextField
                  label="Additional Comments"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={comments}
                  onChange={async (e) => {
                    const newComments = e.target.value;
                    setComments(newComments);

                    // Auto-save comments to database
                    try {
                      await axios.post("/api/qa/submit-step", {
                        qa_task_id: task.qa_task_id,
                        frame: step,
                        checks: checks,
                        comments: newComments,
                      });
                      console.log(`[FrameQA] Saved step ${step} comments`);
                    } catch (error) {
                      console.error(
                        `[FrameQA] Failed to save step ${step} comments:`,
                        error
                      );
                    }
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&:hover": {
                        boxShadow: "0 4px 20px rgba(48,79,254,0.2)",
                      },
                    },
                  }}
                />
                <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
                  {/* Navigation buttons */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    {step > 1 && (
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => onPrevious && onPrevious()}
                        sx={{
                          flex: 1,
                          py: 1,
                          borderRadius: 1,
                          fontWeight: 600,
                          borderColor: "rgba(48,79,254,0.5)",
                          color: "#304ffe",
                          "&:hover": {
                            borderColor: "#304ffe",
                            backgroundColor: "rgba(48,79,254,0.1)",
                          },
                        }}
                      >
                        Back to Step {step - 1}
                      </Button>
                    )}

                    {/* Step indicator */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        backgroundColor: "rgba(48,79,254,0.1)",
                        border: "1px solid rgba(48,79,254,0.3)",
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((stepNum) => (
                        <Box
                          key={stepNum}
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor:
                              stepNum === step
                                ? "#304ffe"
                                : stepNum < step
                                ? "#4caf50"
                                : "rgba(255,255,255,0.3)",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Main action button */}
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => onNext(checks, comments)}
                    sx={{
                      py: 1.5,
                      borderRadius: 1,
                      fontWeight: 600,
                      background: "linear-gradient(45deg,#304ffe,#7c4dff)",
                      "&:hover": {
                        background: "linear-gradient(45deg,#1e3aff,#6c3dff)",
                      },
                    }}
                  >
                    {step === 1
                      ? "Continue to Step 2: Captions & Title Cards"
                      : step === 2
                      ? "Continue to Step 3: Background & Music"
                      : step === 3
                      ? "Continue to Step 4:  Visual & Timing Errors"
                      : step === 4
                      ? "Continue to Step 5: Audio & Misc. Glitches"
                      : "Complete YT SHORT FORM Review"}
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
