import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  Badge,
  Progress,
  Button,
  SimpleGrid,
  Icon,
  Spinner,
  Alert,
} from '@chakra-ui/react';
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
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

// Flowchart component showing incident workflow
const IncidentFlowchart = ({ state }: { state: IncidentDetail['state'] }) => {
  const steps = [
    { id: 'memory', label: 'Memory Retrieval', completed: !!state.long_term_context },
    { id: 'fusion', label: 'Signal Fusion', completed: !!state.fused_incident },
    { id: 'risk', label: 'Risk Assessment', completed: state.severity !== null },
    { id: 'human', label: 'Human Review', completed: !state.requires_human },
    { id: 'planning', label: 'Response Planning', completed: !!state.plan },
    { id: 'execution', label: 'Action Execution', completed: !!state.execution_results },
    { id: 'monitoring', label: 'Monitoring', completed: true },
    { id: 'reflection', label: 'Self-Reflection', completed: !!state.reflection },
  ];

  return (
    <Box
      p={6}
      bg="white"
      borderRadius="xl"
      boxShadow="md"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Heading size="md" mb={4}>
        Incident Workflow
      </Heading>
      <Box position="relative" py={4}>
        {steps.map((step, index) => (
          <Box key={step.id} position="relative" mb={8}>
            <HStack gap={4}>
              <Box
                w="50px"
                h="50px"
                borderRadius="full"
                bg={step.completed ? 'green.500' : 'gray.300'}
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                flexShrink={0}
              >
                {step.completed ? <Icon as={FiCheckCircle} boxSize={6} /> : index + 1}
              </Box>
              <Box flex={1}>
                <Text fontWeight="semibold" fontSize="md">
                  {step.label}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {step.completed ? 'Completed' : 'Pending'}
                </Text>
              </Box>
              {step.completed && (
                <Badge colorScheme="green">Done</Badge>
              )}
            </HStack>
            {index < steps.length - 1 && (
              <Box
                position="absolute"
                left="25px"
                top="50px"
                w="2px"
                h="32px"
                bg={step.completed ? 'green.500' : 'gray.300'}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Metrics visualization component
const MetricsCharts = ({ incident }: { incident: IncidentDetail }) => {
  const { state } = incident;
  
  const severityData = [
    { name: 'Severity', value: incident.severity ?? 0, max: 5 },
  ];

  const confidenceData = [
    { name: 'Confidence', value: (state.confidence ?? 0) * 100, max: 100 },
  ];

  const pieData = [
    { name: 'Risk Score', value: (incident.risk_score ?? 0) * 100 },
    { name: 'Remaining', value: 100 - (incident.risk_score ?? 0) * 100 },
  ];

  const COLORS = ['#E53E3E', '#EDF2F7'];

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
      <Card.Root>
        <Card.Header>
          <Heading size="sm">Severity Level</Heading>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="value" fill="#E53E3E" />
            </BarChart>
          </ResponsiveContainer>
          <Text mt={2} textAlign="center" fontSize="2xl" fontWeight="bold">
            {incident.severity ?? 'N/A'} / 5
          </Text>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="sm">Risk Score Distribution</Heading>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="sm">Confidence Level</Heading>
        </Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3182CE" />
            </BarChart>
          </ResponsiveContainer>
          <Text mt={2} textAlign="center" fontSize="2xl" fontWeight="bold">
            {(state.confidence ?? 0) * 100}%
          </Text>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="sm">Risk Score</Heading>
        </Card.Header>
        <Card.Body>
          <Box>
            <Progress.Root
              value={(incident.risk_score ?? 0) * 100}
              max={100}
              size="lg"
              colorScheme={
                (incident.risk_score ?? 0) > 0.7
                  ? 'red'
                  : (incident.risk_score ?? 0) > 0.4
                  ? 'yellow'
                  : 'green'
              }
              borderRadius="full"
            />
            <Text mt={4} textAlign="center" fontSize="2xl" fontWeight="bold">
              {(incident.risk_score ?? 0) * 100}%
            </Text>
          </Box>
        </Card.Body>
      </Card.Root>
    </SimpleGrid>
  );
};

// Execution results component
const ExecutionResults = ({ executionResults }: { executionResults: any }) => {
  if (!executionResults) return null;

  let parsed: any = {};
  try {
    parsed = typeof executionResults === 'string' 
      ? JSON.parse(executionResults) 
      : executionResults;
  } catch {
    parsed = { raw: String(executionResults) };
  }

  const actions = parsed.execution_actions || parsed.actions || parsed;

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">Execution Results</Heading>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          {actions.voice && (
            <HStack p={3} bg="blue.50" borderRadius="md">
              <Icon as={FiVolume2} color="blue.500" boxSize={5} />
              <Box flex={1}>
                <Text fontWeight="semibold">Voice Announcement</Text>
                <Text fontSize="sm" color="gray.600">
                  {actions.voice.message || actions.voice}
                </Text>
              </Box>
              <Badge colorScheme="blue">Sent</Badge>
            </HStack>
          )}
          {actions.email && (
            <HStack p={3} bg="green.50" borderRadius="md">
              <Icon as={FiMail} color="green.500" boxSize={5} />
              <Box flex={1}>
                <Text fontWeight="semibold">Email Notification</Text>
                <Text fontSize="sm" color="gray.600">
                  {actions.email.recipient || actions.email}
                </Text>
              </Box>
              <Badge colorScheme="green">Sent</Badge>
            </HStack>
          )}
          {actions.call && (
            <HStack p={3} bg="purple.50" borderRadius="md">
              <Icon as={FiPhone} color="purple.500" boxSize={5} />
              <Box flex={1}>
                <Text fontWeight="semibold">Phone Call</Text>
                <Text fontSize="sm" color="gray.600">
                  {actions.call.recipient || actions.call}
                </Text>
              </Box>
              <Badge colorScheme="purple">Placed</Badge>
            </HStack>
          )}
          {!actions.voice && !actions.email && !actions.call && (
            <Text color="gray.600" fontSize="sm">
              No execution actions recorded
            </Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export const IncidentDetail = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    if (incidentId) {
      void fetchIncident();
    }
  }, [incidentId]);

  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Loading incident details...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !incident) {
    return (
      <Box p={8}>
        <Alert.Root status="error">
          <Alert.Title>{error || 'Incident not found'}</Alert.Title>
        </Alert.Root>
        <Button mt={4} onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const { state } = incident;

  return (
    <Box p={6}>
      <HStack mb={6} gap={4}>
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
        >
          <Icon as={FiArrowLeft} mr={2} />
          Back to Dashboard
        </Button>
      </HStack>

      <VStack align="stretch" gap={6}>
        {/* Header */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Heading size="lg">Incident Details</Heading>
            <HStack>
              <Badge
                colorScheme={incident.resolved ? 'green' : 'yellow'}
                fontSize="md"
                px={3}
                py={1}
              >
                {incident.resolved ? 'Resolved' : 'Open'}
              </Badge>
              {state.requires_human && (
                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                  Human Review Required
                </Badge>
              )}
              {state.escalation_required && (
                <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                  Escalation Required
                </Badge>
              )}
            </HStack>
          </HStack>
          <Text color="gray.600" fontSize="sm" fontFamily="mono">
            ID: {incident.incident_id}
          </Text>
          <Text color="gray.600" fontSize="sm">
            Store: {incident.store_id}
          </Text>
        </Box>

        {/* Key Metrics Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
          <Card.Root borderTopWidth="3px" borderTopColor="red.400">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Severity</Heading>
                <Icon as={FiAlertTriangle} color="red.400" boxSize={5} />
              </HStack>
            </Card.Header>
            <Card.Body>
              <Text fontSize="3xl" fontWeight="bold">
                {incident.severity ?? 'N/A'}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Out of 5
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root borderTopWidth="3px" borderTopColor="blue.400">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Risk Score</Heading>
                <Icon as={FiShield} color="blue.400" boxSize={5} />
              </HStack>
            </Card.Header>
            <Card.Body>
              <Text fontSize="3xl" fontWeight="bold">
                {incident.risk_score != null
                  ? (incident.risk_score * 100).toFixed(1)
                  : 'N/A'}
                %
              </Text>
              <Progress.Root
                mt={2}
                value={(incident.risk_score ?? 0) * 100}
                max={100}
                size="sm"
                colorScheme={
                  (incident.risk_score ?? 0) > 0.7
                    ? 'red'
                    : (incident.risk_score ?? 0) > 0.4
                    ? 'yellow'
                    : 'green'
                }
              />
            </Card.Body>
          </Card.Root>

          <Card.Root borderTopWidth="3px" borderTopColor="green.400">
            <Card.Header>
              <HStack justify="space-between">
                <Heading size="sm">Confidence</Heading>
                <Icon as={FiActivity} color="green.400" boxSize={5} />
              </HStack>
            </Card.Header>
            <Card.Body>
              <Text fontSize="3xl" fontWeight="bold">
                {state.confidence != null
                  ? (state.confidence * 100).toFixed(1)
                  : 'N/A'}
                %
              </Text>
              <Text fontSize="sm" color="gray.500">
                Detection confidence
              </Text>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Incident Type */}
        {incident.incident_type && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Incident Type</Heading>
            </Card.Header>
            <Card.Body>
              <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                {incident.incident_type}
              </Badge>
            </Card.Body>
          </Card.Root>
        )}

        {/* Flowchart */}
        <IncidentFlowchart state={state} />

        {/* Metrics Charts */}
        <Box>
          <Heading size="md" mb={4}>
            Metrics & Analytics
          </Heading>
          <MetricsCharts incident={incident} />
        </Box>

        {/* Plan */}
        {incident.plan && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Response Plan</Heading>
            </Card.Header>
            <Card.Body>
              {typeof incident.plan === 'string' ? (
                <Text whiteSpace="pre-wrap">{incident.plan}</Text>
              ) : Array.isArray(incident.plan) ? (
                <VStack align="stretch" gap={2}>
                  {(incident.plan as string[]).map((step: string, idx: number) => (
                    <HStack key={idx} align="flex-start">
                      <Badge colorScheme="blue" minW="30px" textAlign="center">
                        {idx + 1}
                      </Badge>
                      <Text flex={1}>{step}</Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text>{String(incident.plan)}</Text>
              )}
            </Card.Body>
          </Card.Root>
        )}

        {/* Execution Results */}
        <ExecutionResults executionResults={incident.execution_results || state.execution_results} />

        {/* Explanation */}
        {incident.explanation && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Decision Explanation</Heading>
            </Card.Header>
            <Card.Body>
              <Text whiteSpace="pre-wrap">{incident.explanation}</Text>
            </Card.Body>
          </Card.Root>
        )}

        {/* Reflection */}
        {state.reflection && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Self-Reflection & Learning</Heading>
            </Card.Header>
            <Card.Body>
              <Text whiteSpace="pre-wrap">{state.reflection}</Text>
              {state.reflection_tags && state.reflection_tags.length > 0 && (
                <HStack mt={4} flexWrap="wrap" gap={2}>
                  {state.reflection_tags.map((tag, idx) => (
                    <Badge key={idx} colorScheme="purple">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              )}
            </Card.Body>
          </Card.Root>
        )}

        {/* Observations */}
        {(state.vision_observation || state.audio_observation || state.video_observation) && (
          <Card.Root>
            <Card.Header>
              <Heading size="md">Observations</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="stretch" gap={3}>
                {state.vision_observation && (
                  <Box>
                    <HStack mb={2}>
                      <Icon as={FiEye} />
                      <Text fontWeight="semibold">Vision Observation</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" pl={6}>
                      {typeof state.vision_observation === 'string'
                        ? state.vision_observation
                        : JSON.stringify(state.vision_observation, null, 2)}
                    </Text>
                  </Box>
                )}
                {state.audio_observation && (
                  <Box>
                    <HStack mb={2}>
                      <Icon as={FiVolume2} />
                      <Text fontWeight="semibold">Audio Observation</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600" pl={6}>
                      {typeof state.audio_observation === 'string'
                        ? state.audio_observation
                        : JSON.stringify(state.audio_observation, null, 2)}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  );
};

