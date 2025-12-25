import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
} from '@mui/material';
import {
  FiArrowLeft,
  FiAlertTriangle,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiEye,
  FiMail,
  FiPhone,
  FiVolume2,
  FiCopy,
  FiChevronDown,
  FiInfo,
  FiClock,
  FiUser,
  FiTarget,
  FiFileText,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import { Icon } from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

interface IncidentDetail {
  incident_id: string;
  store_id: string;
  resolved: boolean;
  severity: number | null;
  risk_score: number | null;
  incident_type: string | null;
  plan: string | null;
  execution_results: string | null;
  explanation: string | null;
  reflection: string | null;
  state: {
    vision_observation?: any;
    audio_observation?: any;
    video_observation?: any;
    vision_signal?: any;
    audio_signal?: any;
    fused_incident?: any;
    incident_type?: string;
    confidence?: number;
    severity?: number;
    risk_score?: number;
    requires_human?: boolean;
    escalation_required?: boolean;
    plan?: string[] | string;
    execution_actions?: any;
    execution_results?: any;
    explanation?: string;
    reflection?: string;
    reflection_tags?: string[];
    long_term_context?: string;
    episode_memory?: string[];
  };
}

// Helper function to copy to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// 1. INCIDENT SUMMARY SECTION
const IncidentSummary = ({ incident }: { incident: IncidentDetail }) => {
  const { state } = incident;
  const severity = incident.severity ?? state.severity ?? 0;
  const riskScore = incident.risk_score ?? state.risk_score ?? 0;
  const confidence = state.confidence ?? 0;
  const severityColor = severity >= 4 ? 'error' : severity >= 3 ? 'warning' : 'success';

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Incident ID
              </Typography>
              <Tooltip title="Copy ID">
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(incident.incident_id)}
                  sx={{ p: 0.5 }}
                >
                  <Icon component={FiCopy} sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                wordBreak: 'break-all',
              }}
            >
              {incident.incident_id}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
              Store ID
            </Typography>
            <Chip
              label={incident.store_id}
              size="small"
              icon={<Icon component={FiTarget} />}
              sx={{ fontWeight: 600 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
              Incident Type
            </Typography>
            <Chip
              label={incident.incident_type ?? state.incident_type ?? 'Unknown'}
              color="primary"
              size="small"
              icon={<Icon component={FiAlertTriangle} />}
              sx={{ fontWeight: 600 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
              Status
            </Typography>
            <Chip
              label={incident.resolved ? 'Resolved' : 'Active'}
              color={incident.resolved ? 'success' : 'warning'}
              size="small"
              icon={<Icon component={incident.resolved ? FiCheckCircle : FiActivity} />}
              sx={{ fontWeight: 600 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            height: '100%',
            borderLeft: `4px solid`,
            borderLeftColor: severityColor === 'error' ? 'error.main' : severityColor === 'warning' ? 'warning.main' : 'success.main',
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Severity Level
              </Typography>
              <Tooltip title="Severity scale: 1-5 (5 = Critical)">
                <Icon component={FiInfo} sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Tooltip>
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h4" fontWeight="bold" sx={{ color: `${severityColor}.main` }}>
                {severity}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                / 5
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 500 }}>
              Risk Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={riskScore * 100}
              sx={{
                height: 10,
                borderRadius: '9999px',
                mb: 1,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '9999px',
                  bgcolor:
                    riskScore > 0.7
                      ? 'error.main'
                      : riskScore > 0.4
                      ? 'warning.main'
                      : 'success.main',
                },
              }}
            />
            <Typography variant="h6" fontWeight="bold">
              {(riskScore * 100).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Final Confidence
              </Typography>
              <Tooltip title="AI confidence in the incident detection">
                <Icon component={FiInfo} sx={{ fontSize: 14, color: 'text.secondary' }} />
              </Tooltip>
            </Stack>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
              {(confidence * 100).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
              Flags
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {state.requires_human && (
                <Chip
                  label="Human Review"
                  color="error"
                  size="small"
                  icon={<Icon component={FiUser} />}
                />
              )}
              {state.escalation_required && (
                <Chip
                  label="Escalation"
                  color="warning"
                  size="small"
                  icon={<Icon component={FiAlertTriangle} />}
                />
              )}
              {!state.requires_human && !state.escalation_required && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  No flags
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// 2. RISK & CONFIDENCE ANALYTICS
const RiskConfidenceAnalytics = ({ incident }: { incident: IncidentDetail }) => {
  const { state } = incident;
  const riskScore = incident.risk_score ?? state.risk_score ?? 0;
  const confidence = state.confidence ?? 0;
  const visionConfidence = state.vision_signal?.confidence ?? 0;

  const riskData = [
    { name: 'Risk', value: riskScore * 100, fill: riskScore > 0.7 ? '#ef4444' : riskScore > 0.4 ? '#f59e0b' : '#10b981' },
    { name: 'Remaining', value: 100 - riskScore * 100, fill: '#e5e7eb' },
  ];

  const confidenceData = [
    { name: 'Vision Confidence', value: visionConfidence * 100, fill: '#3b82f6' },
    { name: 'Final Confidence', value: confidence * 100, fill: '#8b5cf6' },
    { name: 'Remaining', value: 100 - confidence * 100, fill: '#e5e7eb' },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ borderRadius: 2, p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Risk Score
            </Typography>
            <Tooltip title="Overall risk assessment based on severity, confidence, and historical patterns">
              <Icon component={FiInfo} sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
          </Stack>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="90%"
                data={riskData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
                <RechartsTooltip />
              </RadialBarChart>
            </ResponsiveContainer>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                color: 'text.primary'
              }}
            >
              {(riskScore * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ borderRadius: 2, p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Confidence Breakdown
            </Typography>
            <Tooltip title="Vision confidence vs final combined confidence after fusion">
              <Icon component={FiInfo} sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Tooltip>
          </Stack>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: '#3b82f6', borderRadius: '50%' }} />
              <Typography variant="caption">Vision: {(visionConfidence * 100).toFixed(1)}%</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: '#8b5cf6', borderRadius: '50%' }} />
              <Typography variant="caption">Final: {(confidence * 100).toFixed(1)}%</Typography>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

// 3. INCIDENT EVIDENCE (VISION-BASED)
const IncidentEvidence = ({ state }: { state: IncidentDetail['state'] }) => {
  const [expanded, setExpanded] = useState(false);
  const visionSignal = state.vision_signal || {};
  const visionObs = state.vision_observation || {};
  
  // Extract evidence data
  const scenarioLabel = typeof visionSignal.scenario === 'string' ? visionSignal.scenario : 
                        (typeof visionObs.caption === 'string' ? visionObs.caption : 'Incident Detected');
  const aiDescription = typeof visionSignal.description === 'string' ? visionSignal.description :
                        (typeof visionObs.description === 'string' ? visionObs.description : 'AI analysis in progress');
  const evidenceSource = typeof visionObs.caption === 'string' ? visionObs.caption :
                         (typeof visionSignal.source === 'string' ? visionSignal.source : 'Vision System');
  const peopleCount = typeof visionSignal.people_detected === 'number' ? visionSignal.people_detected :
                      (typeof visionObs.people_count === 'number' ? visionObs.people_count : 0);
  const objectsCount = typeof visionSignal.objects_detected === 'number' ? visionSignal.objects_detected :
                       (typeof visionObs.objects_count === 'number' ? visionObs.objects_count : 0);

  // Mock detection details for chart
  const detectionData = [
    { name: 'People', detected: peopleCount, confidence: 85 },
    { name: 'Objects', detected: objectsCount, confidence: 72 },
  ];

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          AI Evidence Summary
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                  Scenario Label
                </Typography>
                <Chip
                  label={scenarioLabel}
                  color="primary"
                  icon={<Icon component={FiAlertTriangle} />}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                  AI Description
                </Typography>
                <Typography variant="body1">{aiDescription}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                  Evidence Source
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {evidenceSource}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    People Detected
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {peopleCount}
                  </Typography>
                </Stack>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Objects Detected
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {objectsCount}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{ mt: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <AccordionSummary expandIcon={<Icon component={FiChevronDown} />}>
            <Typography fontWeight={600}>View Detection Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="detected" fill="#3b82f6" />
                  <Bar dataKey="confidence" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                Detection confidence represents the AI's certainty in identifying people and objects.
                Higher confidence indicates more reliable detections.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

// 4. INCIDENT FLOW (HORIZONTAL)
const IncidentFlow = ({ incident }: { incident: IncidentDetail }) => {
  const { state } = incident;
  const steps = [
    { id: 'detected', label: 'Incident Detected', completed: true, icon: FiAlertTriangle },
    { id: 'vision', label: 'Vision Signal Triggered', completed: !!state.vision_signal, icon: FiEye },
    { id: 'severity', label: 'Severity Evaluated', completed: state.severity !== null, icon: FiShield },
    { id: 'plan', label: 'Response Plan Generated', completed: !!state.plan, icon: FiTarget },
    { id: 'pa', label: 'PA Announcement Sent', completed: !!state.execution_actions?.voice, icon: FiVolume2 },
    { id: 'email', label: 'Email Sent', completed: !!state.execution_actions?.email, icon: FiMail },
    { id: 'call', label: 'Emergency Call Initiated', completed: !!state.execution_actions?.call, icon: FiPhone },
    { id: 'resolved', label: 'Incident Resolved', completed: incident.resolved !== false, icon: FiCheckCircle },
  ];

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4, p: 3 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Incident Response Flow
      </Typography>
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ minWidth: 'max-content' }}>
          {steps.map((step, index) => (
            <Box key={step.id} sx={{ display: 'flex', alignItems: 'center', minWidth: 180 }}>
              <Stack alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Paper
                  elevation={step.completed ? 4 : 1}
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: step.completed ? 'primary.main' : 'grey.300',
                    color: step.completed ? 'white' : 'text.secondary',
                    transition: 'all 0.3s',
                  }}
                >
                  <Icon component={step.icon} sx={{ fontSize: 28 }} />
                </Paper>
                <Typography
                  variant="body2"
                  fontWeight={step.completed ? 600 : 400}
                  textAlign="center"
                  sx={{ maxWidth: 120 }}
                >
                  {step.label}
                </Typography>
                {step.completed && (
                  <Chip label="Done" color="success" size="small" icon={<Icon component={FiCheckCircle} />} />
                )}
              </Stack>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    bgcolor: step.completed ? 'primary.main' : 'grey.300',
                    mx: 1,
                    transition: 'all 0.3s',
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

// 5. RESPONSE PLAN (STEPPER)
const ResponsePlan = ({ plan }: { plan: string | string[] | null | undefined }) => {
  if (!plan) return null;

  const planSteps = Array.isArray(plan) ? plan : typeof plan === 'string' ? plan.split('\n').filter(Boolean) : [];

  if (planSteps.length === 0) return null;

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Response Plan
        </Typography>
        <Stepper orientation="vertical">
          {planSteps.map((step, index) => (
            <Step key={index} active={true} completed={true}>
              <StepLabel
                StepIconComponent={() => (
                  <Paper
                    elevation={2}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Paper>
                )}
              >
                <Typography variant="body1" fontWeight={500}>
                  Step {index + 1}
                </Typography>
              </StepLabel>
              <StepContent>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, mt: 1 }}>
                  <Typography variant="body2">{step}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Icon component={FiCheckCircle} sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Completed
                    </Typography>
                  </Stack>
                </Paper>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

// 5B. SUMMARIZED RESPONSE PLAN COMPONENT
interface SummarizedResponsePlan {
  plan_title: string;
  incident_overview: {
    incident_id: string;
    incident_type: string;
    severity: string;
  };
  executive_summary: string;
  critical_actions: string[];
  response_phases: Array<{
    phase_name: string;
    phase_actions: string[];
  }>;
  communication_protocol: string[];
  safety_priorities: string[];
  documentation_requirements: string[];
  notes: string;
}

const SummarizedResponsePlanSection = ({ incidentId }: { incidentId: string }) => {
  const [plan, setPlan] = useState<SummarizedResponsePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/incident/${incidentId}/summarize-plan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate plan');
      }

      const data = await res.json();
      setPlan(data);
      setExpanded(true);
    } catch (e: any) {
      console.error('Error generating plan', e);
      setError(e.message || 'Error generating summarized response plan');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJSON = () => {
    if (!plan) return;
    
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-plan-${incidentId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsText = () => {
    if (!plan) return;
    
    let text = `${plan.plan_title}\n`;
    text += '='.repeat(50) + '\n\n';
    text += `INCIDENT OVERVIEW\n`;
    text += `- Incident ID: ${plan.incident_overview.incident_id}\n`;
    text += `- Incident Type: ${plan.incident_overview.incident_type}\n`;
    text += `- Severity: ${plan.incident_overview.severity}\n\n`;
    text += `EXECUTIVE SUMMARY\n`;
    text += `${plan.executive_summary}\n\n`;
    text += `CRITICAL ACTIONS\n`;
    plan.critical_actions.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    text += `\nRESPONSE PHASES\n`;
    plan.response_phases.forEach((phase, phaseIdx) => {
      text += `\n${phaseIdx + 1}. ${phase.phase_name}\n`;
      phase.phase_actions.forEach((action, idx) => {
        text += `   ${idx + 1}. ${action}\n`;
      });
    });
    text += `\nCOMMUNICATION PROTOCOL\n`;
    plan.communication_protocol.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    text += `\nSAFETY PRIORITIES\n`;
    plan.safety_priorities.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    text += `\nDOCUMENTATION REQUIREMENTS\n`;
    plan.documentation_requirements.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    text += `\n${plan.notes}\n`;
    
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `response-plan-${incidentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon component={FiTarget} sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h6" fontWeight={600}>
              Summarized Response Plan
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {!plan && (
              <Button
                variant="contained"
                startIcon={<Icon component={FiRefreshCw} />}
                onClick={generatePlan}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Generating...' : 'Generate Summary'}
              </Button>
            )}
            {plan && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiDownload} />}
                  onClick={downloadAsText}
                  sx={{ borderRadius: 2 }}
                >
                  Download TXT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiDownload} />}
                  onClick={downloadAsJSON}
                  sx={{ borderRadius: 2 }}
                >
                  Download JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiRefreshCw} />}
                  onClick={generatePlan}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Regenerate
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Generating executive summary...
            </Typography>
          </Box>
        )}

        {plan && (
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<Icon component={FiChevronDown} />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {plan.plan_title} - {plan.incident_overview.incident_id}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Incident Overview */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
                    Incident Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Incident ID
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {plan.incident_overview.incident_id}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Incident Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {plan.incident_overview.incident_type}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Severity
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {plan.incident_overview.severity}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Executive Summary */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Executive Summary
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {plan.executive_summary}
                    </Typography>
                  </Paper>
                </Box>

                {/* Critical Actions */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Critical Actions
                  </Typography>
                  <Stack spacing={1}>
                    {plan.critical_actions.map((action, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'error.50', borderRadius: 2, borderLeft: '3px solid', borderLeftColor: 'error.main' }}>
                        <Stack direction="row" spacing={1}>
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 24, color: 'error.main' }}>
                            {idx + 1}.
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>{action}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Response Phases */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Response Phases
                  </Typography>
                  <Stack spacing={2}>
                    {plan.response_phases.map((phase, phaseIdx) => (
                      <Paper key={phaseIdx} elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 1.5, color: 'primary.main' }}>
                          {phaseIdx + 1}. {phase.phase_name}
                        </Typography>
                        <Stack spacing={1}>
                          {phase.phase_actions.map((action, idx) => (
                            <Stack key={idx} direction="row" spacing={1}>
                              <Typography variant="body2" sx={{ minWidth: 24, color: 'text.secondary' }}>
                                {idx + 1}.
                              </Typography>
                              <Typography variant="body2">{action}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Communication Protocol */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Communication Protocol
                  </Typography>
                  <Stack spacing={1}>
                    {plan.communication_protocol.map((item, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'info.50', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Icon component={FiMail} sx={{ fontSize: 16, color: 'info.main', mt: 0.5 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Safety Priorities */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Safety Priorities
                  </Typography>
                  <Stack spacing={1}>
                    {plan.safety_priorities.map((item, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'warning.50', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Icon component={FiShield} sx={{ fontSize: 16, color: 'warning.main', mt: 0.5 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Documentation Requirements */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Documentation Requirements
                  </Typography>
                  <Stack spacing={1}>
                    {plan.documentation_requirements.map((item, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Icon component={FiFileText} sx={{ fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Notes */}
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">{plan.notes}</Typography>
                </Alert>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

// 6. EXECUTION TIMELINE
const ExecutionTimeline = ({ executionResults }: { executionResults: any }) => {
  if (!executionResults) return null;

  let parsed: any = {};
  try {
    parsed = typeof executionResults === 'string' ? JSON.parse(executionResults) : executionResults;
  } catch {
    parsed = { raw: String(executionResults) };
  }

  const actions = parsed.execution_actions || parsed.actions || parsed;
  const timelineItems = [];

  if (actions.voice) {
    timelineItems.push({
      icon: FiVolume2,
      color: 'primary',
      title: 'PA Announcement Sent',
      description: actions.voice.message || actions.voice,
      time: 'Immediate',
    });
  }

  if (actions.email) {
    timelineItems.push({
      icon: FiMail,
      color: 'success',
      title: 'Email Notification Sent',
      description: actions.email.recipient || actions.email,
      time: 'Immediate',
    });
  }

  if (actions.call) {
    timelineItems.push({
      icon: FiPhone,
      color: 'error',
      title: 'Emergency Call Initiated',
      description: actions.call.recipient || actions.call,
      time: 'Immediate',
    });
  }

  if (timelineItems.length === 0) return null;

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Execution Timeline
        </Typography>
        <Timeline>
          {timelineItems.map((item, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color={item.color as any}>
                  <Icon component={item.icon} />
                </TimelineDot>
                {index < timelineItems.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.time}
                      size="small"
                      icon={<Icon component={FiClock} />}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.description}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
};

// 7. SUMMARIZED REPORT COMPONENT
interface SummarizedReport {
  report_title: string;
  incident_overview: {
    incident_id: string;
    store_id: string;
    incident_type: string;
    severity: string;
    risk_score: string;
    confidence: string;
  };
  executive_summary: string;
  decision_rationale: string[];
  actions_taken: string[];
  policy_reference: {
    policy_id: string;
    version: string;
    effective_date: string;
  };
  notes: string;
}

const SummarizedReportSection = ({ incidentId }: { incidentId: string }) => {
  const [report, setReport] = useState<SummarizedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/incident/${incidentId}/summarize-report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to generate report');
      }

      const data = await res.json();
      setReport(data);
      setExpanded(true);
    } catch (e: any) {
      console.error('Error generating report', e);
      setError(e.message || 'Error generating summarized report');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsJSON = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-report-${incidentId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsText = () => {
    if (!report) return;
    
    let text = `${report.report_title}\n`;
    text += '='.repeat(50) + '\n\n';
    text += `INCIDENT OVERVIEW\n`;
    text += `- Incident ID: ${report.incident_overview.incident_id}\n`;
    text += `- Store ID: ${report.incident_overview.store_id}\n`;
    text += `- Incident Type: ${report.incident_overview.incident_type}\n`;
    text += `- Severity: ${report.incident_overview.severity}\n`;
    text += `- Risk Score: ${report.incident_overview.risk_score}\n`;
    text += `- Confidence: ${report.incident_overview.confidence}\n\n`;
    text += `EXECUTIVE SUMMARY\n`;
    text += `${report.executive_summary}\n\n`;
    text += `DECISION RATIONALE\n`;
    report.decision_rationale.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    text += `\nACTIONS TAKEN\n`;
    report.actions_taken.forEach((item, idx) => {
      text += `${idx + 1}. ${item}\n`;
    });
    if (report.policy_reference.policy_id) {
      text += `\nPOLICY REFERENCE\n`;
      text += `- Policy ID: ${report.policy_reference.policy_id}\n`;
      text += `- Version: ${report.policy_reference.version}\n`;
      text += `- Effective Date: ${report.policy_reference.effective_date}\n`;
    }
    text += `\n${report.notes}\n`;
    
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-report-${incidentId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon component={FiFileText} sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="h6" fontWeight={600}>
              Summarized Report
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {!report && (
              <Button
                variant="contained"
                startIcon={<Icon component={FiRefreshCw} />}
                onClick={generateReport}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            )}
            {report && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiDownload} />}
                  onClick={downloadAsText}
                  sx={{ borderRadius: 2 }}
                >
                  Download TXT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiDownload} />}
                  onClick={downloadAsJSON}
                  sx={{ borderRadius: 2 }}
                >
                  Download JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Icon component={FiRefreshCw} />}
                  onClick={generateReport}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  Regenerate
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Generating professional report...
            </Typography>
          </Box>
        )}

        {report && (
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<Icon component={FiChevronDown} />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {report.report_title} - {report.incident_overview.incident_id}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Incident Overview */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
                    Incident Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Incident ID
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.incident_id}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Store ID
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.store_id}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Incident Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.incident_type}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Severity
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.severity}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Risk Score
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.risk_score}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Confidence
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {report.incident_overview.confidence}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Executive Summary */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Executive Summary
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {report.executive_summary}
                    </Typography>
                  </Paper>
                </Box>

                {/* Decision Rationale */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Decision Rationale
                  </Typography>
                  <Stack spacing={1}>
                    {report.decision_rationale.map((item, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 24 }}>
                            {idx + 1}.
                          </Typography>
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Actions Taken */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Actions Taken
                  </Typography>
                  <Stack spacing={1}>
                    {report.actions_taken.map((item, idx) => (
                      <Paper key={idx} elevation={0} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <Icon component={FiCheckCircle} sx={{ fontSize: 16, color: 'success.main', mt: 0.5 }} />
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Policy Reference */}
                {report.policy_reference.policy_id && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                      Policy Reference
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          <strong>Policy ID:</strong> {report.policy_reference.policy_id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Version:</strong> {report.policy_reference.version}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Effective Date:</strong> {report.policy_reference.effective_date}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Box>
                )}

                {/* Notes */}
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">{report.notes}</Typography>
                </Alert>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

// 8. AI EXPLANATION & AUDITABILITY
const AIExplanation = ({ explanation, reflection }: { explanation: string | null; reflection: string | null }) => {
  const [expanded, setExpanded] = useState(false);

  if (!explanation && !reflection) return null;

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
      <CardContent>
        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <AccordionSummary expandIcon={<Icon component={FiChevronDown} />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Icon component={FiInfo} sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Why did the AI take this decision?
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {explanation && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Decision Rationale
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {explanation}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {reflection && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    System Reflection & Learning
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {reflection}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  This explanation provides auditability and transparency into the AI decision-making process.
                  All decisions are logged for compliance and review purposes.
                </Typography>
              </Alert>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export const IncidentDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const incidentId = searchParams.get('id');

  if (!incidentId) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No incident ID provided</Typography>
      </Box>
    );
  }

  useEffect(() => {
    const fetchIncident = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/incident/${incidentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setError('Failed to fetch incident details');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setIncident(data);
      } catch (e) {
        console.error('Error fetching incident', e);
        setError('Error loading incident details');
      } finally {
        setLoading(false);
      }
    };

    void fetchIncident();
  }, [location.search]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>
    );
  }

  if (error || !incident) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error || 'Incident not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ borderRadius: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const { state } = incident;
  const plan = incident.plan || state.plan;
  const executionResults = incident.execution_results || state.execution_results;
  const explanation = incident.explanation ?? state.explanation ?? null;
  const reflection = incident.reflection ?? state.reflection ?? null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Incident ID: {incidentId}</Typography>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/')}
          variant="text"
          startIcon={<Icon component={FiArrowLeft} />}
          sx={{ textTransform: 'none' }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight={700}>
          Incident Details
        </Typography>
        <Box sx={{ width: 100 }} /> {/* Spacer for alignment */}
      </Stack>

      {/* 1. Incident Summary */}
      <IncidentSummary incident={incident} />

      <Divider sx={{ my: 4 }} />

      {/* 2. Risk & Confidence Analytics */}
      <RiskConfidenceAnalytics incident={incident} />

      <Divider sx={{ my: 4 }} />

      {/* 3. Incident Evidence */}
      <IncidentEvidence state={state} />

      <Divider sx={{ my: 4 }} />

      {/* 4. Incident Flow */}
      <IncidentFlow incident={incident} />

      <Divider sx={{ my: 4 }} />

      {/* 5. Response Plan */}
      {plan && <ResponsePlan plan={plan} />}

      {/* 5B. Summarized Response Plan */}
      {plan && <SummarizedResponsePlanSection incidentId={incidentId!} />}

      <Divider sx={{ my: 4 }} />

      {/* 6. Execution Timeline */}
      <ExecutionTimeline executionResults={executionResults} />

      <Divider sx={{ my: 4 }} />

      {/* 7. Summarized Report */}
      <SummarizedReportSection incidentId={incidentId!} />

      <Divider sx={{ my: 4 }} />

      {/* 8. AI Explanation */}
      <AIExplanation explanation={explanation} reflection={reflection} />
    </Box>
  );
};
