import {
  Box,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
  TextField,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Fade,
  Tooltip,
} from '@mui/material';
import { 
  FiAlertTriangle, 
  FiShield, 
  FiActivity, 
  FiArrowRight,
  FiImage,
  FiVideo,
  FiMusic,
  FiX,
  FiUpload,
  FiEye,
  FiCheckCircle,
} from 'react-icons/fi';
import { Icon } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type IncidentSummary = {
  incidentId: string;
  incidentType: string | null;
  severity: number | null;
  riskScore: number | null;
  resolved: boolean;
  requires_human?: boolean;
  escalation_required?: boolean;
};

interface ApiIncidentSummary {
  incident_id: string;
  store_id: string;
  incident_type: string | null;
  severity: number | null;
  risk_score: number | null;
  resolved: boolean;
  requires_human?: boolean;
  escalation_required?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

export const Dashboard = () => {
  const navigate = useNavigate();
  const [lastIncident, setLastIncident] = useState<IncidentSummary | null>(null);
  const [storeId, setStoreId] = useState('store_1');
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [visionPreview, setVisionPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incidentsDialogOpen, setIncidentsDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUserAndIncidents = async () => {
      try {
        const [meRes, incidentsRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/incidents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          if (data.store_id) {
            setStoreId(data.store_id);
          }
        }

        if (incidentsRes.ok) {
          const data: { incidents?: ApiIncidentSummary[] } = await incidentsRes.json();
          const rawList = data.incidents ?? [];
          const list: IncidentSummary[] = rawList.map((inc) => ({
            incidentId: inc.incident_id,
            incidentType: inc.incident_type,
            severity: inc.severity,
            riskScore: inc.risk_score,
            resolved: inc.resolved,
            requires_human: inc.requires_human,
            escalation_required: inc.escalation_required,
          }));
          setIncidents(list);
          setLastIncident(list[0] ?? null);
        }
      } catch (e) {
        console.error('Failed to fetch user/incidents', e);
      }
    };

    void fetchUserAndIncidents();
  }, []);

  const handleSubmitIncident = async () => {
    if (!visionFile && !audioFile && !videoFile) {
      setError('Please upload at least one image, audio, or video file.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: {
        store_id: string;
        vision_observation?: string;
        audio_observation?: string;
        video_observation?: string;
      } = {
        store_id: storeId,
      };

      if (visionFile) {
        payload.vision_observation = await fileToBase64(visionFile);
      }
      if (audioFile) {
        payload.audio_observation = await fileToBase64(audioFile);
      }
      if (videoFile) {
        payload.video_observation = await fileToBase64(videoFile);
      }

      const res = await fetch(`${API_URL}/incident`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData: { error?: string; detail?: string } | unknown = await res
          .json()
          .catch(() => ({}));
        const message =
          (errData as { error?: string }).error ??
          (errData as { detail?: string }).detail ??
          'Failed to create incident';
        setError(typeof message === 'string' ? message : 'Failed to create incident');
        return;
      }

      const data: { incident_id?: string } = await res.json();
      const id = data.incident_id;
      if (id) {
        setIncidentId(id);
        setLastIncident(null);
        // Clear files after successful submission
        setVisionFile(null);
        setAudioFile(null);
        setVideoFile(null);
        setVisionPreview(null);
        setVideoPreview(null);
        // Refresh incidents list
        const token = localStorage.getItem('token');
        if (token) {
          const incidentsRes = await fetch(`${API_URL}/incidents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (incidentsRes.ok) {
            const data: { incidents?: ApiIncidentSummary[] } = await incidentsRes.json();
            const rawList = data.incidents ?? [];
            const list: IncidentSummary[] = rawList.map((inc) => ({
              incidentId: inc.incident_id,
              incidentType: inc.incident_type,
              severity: inc.severity,
              riskScore: inc.risk_score,
              resolved: inc.resolved,
              requires_human: inc.requires_human,
              escalation_required: inc.escalation_required,
            }));
            setIncidents(list);
            setLastIncident(list[0] ?? null);
          }
        }
      }
    } catch (e) {
      console.error('Error submitting incident', e);
      setError('Unexpected error while submitting incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (
    type: 'vision' | 'audio' | 'video',
    file: File | null
  ) => {
    if (type === 'vision') {
      setVisionFile(file);
      setVisionPreview(file ? URL.createObjectURL(file) : null);
    } else if (type === 'audio') {
      setAudioFile(file);
    } else if (type === 'video') {
      setVideoFile(file);
      setVideoPreview(file ? URL.createObjectURL(file) : null);
    }
  };

  const removeFile = (type: 'vision' | 'audio' | 'video') => {
    if (type === 'vision') {
      if (visionPreview) URL.revokeObjectURL(visionPreview);
      setVisionFile(null);
      setVisionPreview(null);
    } else if (type === 'audio') {
      setAudioFile(null);
    } else if (type === 'video') {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label="Live Dashboard"
                size="small"
                sx={{
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={`Store: ${storeId}`}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              />
            </Stack>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
              Incident Management Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Monitor, analyze, and manage security incidents in real-time
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Icon component={FiEye} />}
            onClick={() => setIncidentsDialogOpen(true)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            View All Incidents ({incidents.length})
          </Button>
        </Stack>
      </Box>

      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={4}>
            <Fade in timeout={600}>
              <Card
                sx={{
                  borderTop: '4px solid',
                  borderTopColor: 'error.main',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Last Severity
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: 'error.main' }}>
                        {lastIncident?.severity ?? '--'}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'error.50',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Icon component={FiAlertTriangle} sx={{ fontSize: 28, color: 'error.main' }} />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {lastIncident ? `Incident ${lastIncident.incidentId.slice(0, 8)}…` : 'No incidents yet'}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} sm={6} lg={4}>
            <Fade in timeout={800}>
              <Card
                sx={{
                  borderTop: '4px solid',
                  borderTopColor: 'primary.main',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Risk Score
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        {lastIncident?.riskScore != null ? lastIncident.riskScore.toFixed(1) : '--'}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.50',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Icon component={FiShield} sx={{ fontSize: 28, color: 'primary.main' }} />
                    </Avatar>
                  </Stack>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={lastIncident?.riskScore ?? 0}
                      sx={{
                        height: 10,
                        borderRadius: '9999px',
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: '9999px',
                          bgcolor:
                            lastIncident?.riskScore && lastIncident.riskScore > 70
                              ? 'error.main'
                              : lastIncident?.riskScore && lastIncident.riskScore > 40
                              ? 'warning.main'
                              : 'success.main',
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} sm={6} lg={4}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  borderTop: '4px solid',
                  borderTopColor: 'success.main',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Status
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" sx={{ color: 'success.main' }}>
                        {lastIncident?.resolved ? 'Resolved' : lastIncident ? 'Open' : '--'}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: 'success.50',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Icon component={FiActivity} sx={{ fontSize: 28, color: 'success.main' }} />
                    </Avatar>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {lastIncident?.incidentType ?? 'Waiting for first incident'}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Store ID Input */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Store Configuration
          </Typography>
          <TextField
            fullWidth
            label="Store ID"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            sx={{
              maxWidth: '400px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Upload Sections */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Upload Media for Analysis
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          Upload image, audio, or video files to create a new incident report
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Image Upload Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={600}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: visionFile ? '2px solid' : '1px solid',
                  borderColor: visionFile ? 'primary.main' : 'divider',
                  boxShadow: visionFile ? 4 : 2,
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    bgcolor: visionFile ? 'primary.50' : 'grey.50',
                    p: 3,
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: visionFile ? 'primary.main' : 'grey.400',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Icon component={FiImage} sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    Image Upload
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Vision observation
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {visionPreview ? (
                    <Stack spacing={2}>
                      <Box
                        component="img"
                        src={visionPreview}
                        alt="Preview"
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {visionFile?.name}
                        </Typography>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeFile('vision')}
                            sx={{ color: 'error.main' }}
                          >
                            <Icon component={FiX} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  ) : (
                    <Button
                      component="label"
                      fullWidth
                      variant="outlined"
                      startIcon={<Icon component={FiUpload} />}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        textTransform: 'none',
                      }}
                    >
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('vision', e.target.files?.[0] ?? null)}
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Audio Upload Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={800}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: audioFile ? '2px solid' : '1px solid',
                  borderColor: audioFile ? 'secondary.main' : 'divider',
                  boxShadow: audioFile ? 4 : 2,
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    bgcolor: audioFile ? 'secondary.50' : 'grey.50',
                    p: 3,
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: audioFile ? 'secondary.main' : 'grey.400',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Icon component={FiMusic} sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    Audio Upload
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Audio observation
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {audioFile ? (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          bgcolor: 'secondary.50',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Icon component={FiMusic} sx={{ fontSize: 64, color: 'secondary.main' }} />
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {audioFile.name}
                        </Typography>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeFile('audio')}
                            sx={{ color: 'error.main' }}
                          >
                            <Icon component={FiX} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Stack>
                  ) : (
                    <Button
                      component="label"
                      fullWidth
                      variant="outlined"
                      startIcon={<Icon component={FiUpload} />}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        textTransform: 'none',
                      }}
                    >
                      Choose Audio
                      <input
                        type="file"
                        accept="audio/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('audio', e.target.files?.[0] ?? null)}
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Video Upload Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1000}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: videoFile ? '2px solid' : '1px solid',
                  borderColor: videoFile ? 'error.main' : 'divider',
                  boxShadow: videoFile ? 4 : 2,
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    bgcolor: videoFile ? 'error.50' : 'grey.50',
                    p: 3,
                    textAlign: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: videoFile ? 'error.main' : 'grey.400',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Icon component={FiVideo} sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    Video Upload
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Video observation
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  {videoPreview ? (
                    <Stack spacing={2}>
                      <Box
                        component="video"
                        src={videoPreview}
                        controls
                        sx={{
                          width: '100%',
                          height: 200,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {videoFile?.name}
                        </Typography>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => removeFile('video')}
                            sx={{ color: 'error.main' }}
                          >
                            <Icon component={FiX} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  ) : (
                    <Button
                      component="label"
                      fullWidth
                      variant="outlined"
                      startIcon={<Icon component={FiUpload} />}
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        textTransform: 'none',
                      }}
                    >
                      Choose Video
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange('video', e.target.files?.[0] ?? null)}
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmitIncident}
            disabled={isSubmitting || (!visionFile && !audioFile && !videoFile)}
            startIcon={<Icon component={FiAlertTriangle} />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 4,
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
          </Button>
        </Box>

        {/* Success/Error Messages */}
        {incidentId && (
          <Alert
            severity="success"
            icon={<Icon component={FiCheckCircle} />}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setIncidentId(null)}
          >
            <Typography fontWeight={600}>Incident created successfully!</Typography>
            <Typography variant="body2">Incident ID: {incidentId}</Typography>
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Incidents Dialog */}
        <Dialog
          open={incidentsDialogOpen}
          onClose={() => setIncidentsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          disableEnforceFocus
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                All Incidents
              </Typography>
              <IconButton onClick={() => setIncidentsDialogOpen(false)}>
                <Icon component={FiX} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 0 }}>
            {incidents.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  No incidents found for this store yet.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Submit an incident to see it here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ p: 3 }}>
                {incidents.map((inc) => (
                  <Paper
                    key={inc.incidentId}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: inc.resolved ? 'success.50' : 'warning.50',
                      border: '1px solid',
                      borderColor: inc.resolved ? 'success.200' : 'warning.200',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: inc.resolved ? 'success.main' : 'warning.main',
                      },
                    }}
                    onClick={() => {
                      setIncidentsDialogOpen(false);
                      navigate(`/incident?id=${inc.incidentId}`);
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          label={inc.resolved ? 'Resolved' : 'Open'}
                          color={inc.resolved ? 'success' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        {inc.requires_human && (
                          <Chip label="Human Review" color="error" variant="outlined" size="small" />
                        )}
                        {inc.escalation_required && (
                          <Chip label="Escalation" color="warning" variant="outlined" size="small" />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                          {inc.incidentId}
                        </Typography>
                        <Icon component={FiArrowRight} sx={{ color: 'text.secondary' }} />
                      </Stack>
                    </Stack>
                    <Stack spacing={1}>
                      <Typography variant="body2" fontWeight={600}>
                        Type: {inc.incidentType ?? 'Unknown'}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Severity:</Typography>
                          <Chip label={inc.severity ?? 'N/A'} color="error" size="small" />
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Risk:</Typography>
                          <Chip
                            label={inc.riskScore != null ? inc.riskScore.toFixed(1) : 'N/A'}
                            color="warning"
                            size="small"
                          />
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIncidentsDialogOpen(false)} sx={{ textTransform: 'none' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
