import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Box as ChakraBox,
  Card,
  Badge,
  Progress,
  Text as ChakraText,
  Button,
  Input,
  Image,
} from '@chakra-ui/react';
import { FiAlertTriangle, FiShield, FiActivity, FiArrowRight } from 'react-icons/fi';
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

// Shape returned by backend /incidents endpoint
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        // We only know the ID from this endpoint; details like severity/risk
        // would require a separate GET endpoint in the backend.
        setLastIncident(null);
      }
    } catch (e) {
      console.error('Error submitting incident', e);
      setError('Unexpected error while submitting incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={8} align="flex-start">
        <Box>
          <HStack mb={2} spacing={3} align="center">
            <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
              Live store overview
            </Badge>
          </HStack>
          <Heading size="lg" mb={1}>
            Store dashboard
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Monitor incidents, risk and uploads from a single, unified console.
          </Text>
        </Box>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
        <Card.Root borderTopWidth="3px" borderTopColor="red.400">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="sm">Last severity</Heading>
              <Box
                borderRadius="full"
                bg="red.50"
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiAlertTriangle} color="red.400" />
              </Box>
            </HStack>
          </Card.Header>
          <Card.Body>
            <ChakraText fontSize="3xl" fontWeight="bold">
              {lastIncident?.severity ?? '--'}
            </ChakraText>
            <ChakraText fontSize="sm" color="gray.500">
              {lastIncident ? `Incident ${lastIncident.incidentId.slice(0, 8)}…` : 'No incidents yet'}
            </ChakraText>
          </Card.Body>
        </Card.Root>

        <Card.Root borderTopWidth="3px" borderTopColor="blue.400">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="sm">Risk score</Heading>
              <Box
                borderRadius="full"
                bg="blue.50"
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiShield} color="blue.400" />
              </Box>
            </HStack>
          </Card.Header>
          <Card.Body>
            <ChakraText fontSize="3xl" fontWeight="bold">
              {lastIncident?.riskScore != null ? lastIncident.riskScore.toFixed(1) : '--'}
            </ChakraText>
            <ChakraBox mt={3}>
              <Progress.Root
                value={lastIncident?.riskScore ?? 0}
                max={100}
                size="sm"
                borderRadius="full"
                colorScheme={
                  lastIncident?.riskScore && lastIncident.riskScore > 70
                    ? 'red'
                    : lastIncident?.riskScore && lastIncident.riskScore > 40
                    ? 'yellow'
                    : 'green'
                }
              />
            </ChakraBox>
          </Card.Body>
        </Card.Root>

        <Card.Root borderTopWidth="3px" borderTopColor="green.400">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="sm">Resolution status</Heading>
              <Box
                borderRadius="full"
                bg="green.50"
                p={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiActivity} color="green.400" />
              </Box>
            </HStack>
          </Card.Header>
          <Card.Body>
            <ChakraText fontSize="3xl" fontWeight="bold">
              {lastIncident?.resolved ? 'Resolved' : lastIncident ? 'Open' : '--'}
            </ChakraText>
            <ChakraText fontSize="sm" color="gray.500">
              {lastIncident?.incidentType ?? 'Waiting for first incident'}
            </ChakraText>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Box
        p={0}
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        borderWidth="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        <Box p={6} borderBottomWidth="1px" bgGradient="linear(to-r, blue.50, purple.50)">
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="md" mb={1}>
                Upload media for incident analysis
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Send fresh image, audio, or video directly into the agent pipeline.
              </Text>
            </Box>
            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
              Real‑time AI
            </Badge>
          </HStack>
        </Box>

        <Box p={6} bg="gray.50">
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Store ID
              </Text>
              <Input
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                h={10}
                maxW="sm"
                borderRadius="md"
              />
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Vision Observation (Image)
                </Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setVisionFile(file);
                    setVisionPreview(file ? URL.createObjectURL(file) : null);
                  }}
                  mb={2}
                />
                {visionPreview && (
                  <Image
                    src={visionPreview}
                    alt="Selected vision"
                    boxSize="80px"
                    objectFit="cover"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                  />
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Audio Observation (Audio)
                </Text>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setAudioFile(file);
                  }}
                />
                {audioFile && (
                  <Text mt={1} fontSize="xs" color="gray.600">
                    Selected: {audioFile.name}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Video Observation (Video)
                </Text>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setVideoFile(file);
                  }}
                />
                {videoFile && (
                  <Text mt={1} fontSize="xs" color="gray.600">
                    Selected: {videoFile.name}
                  </Text>
                )}
              </Box>
            </SimpleGrid>

            <Box>
              <Button
                colorScheme="blue"
                onClick={handleSubmitIncident}
                loading={isSubmitting}
                loadingText="Submitting incident..."
              >
                🚨 Submit Incident
              </Button>
            </Box>

            {incidentId && (
              <Box>
                <Text fontSize="sm" color="green.600">
                  Incident created: <b>{incidentId}</b>
                </Text>
              </Box>
            )}

            {error && (
              <Box>
                <Text fontSize="sm" color="red.500">
                  {error}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>

      <Box my={8} h="1px" bg="gray.200" borderRadius="full" />

      <Box
        p={6}
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        borderWidth="1px"
      >
        <Heading size="md" mb={1}>
          Current incidents
        </Heading>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Latest incidents for this store, most recent first.
        </Text>
        {incidents.length === 0 ? (
          <Text color="gray.600" fontSize="sm">
            No incidents found for this store yet. Submit an incident to see it here.
          </Text>
        ) : (
          <VStack align="stretch" gap={3}>
            {incidents.map((inc) => (
              <Box
                key={inc.incidentId}
                borderWidth="1px"
                borderRadius="lg"
                p={3}
                bg={inc.resolved ? 'green.50' : 'yellow.50'}
                borderColor={inc.resolved ? 'green.200' : 'yellow.200'}
                _hover={{ boxShadow: 'md', transform: 'translateY(-1px)', cursor: 'pointer' }}
                transition="all 0.15s ease-out"
                onClick={() => navigate(`/incident/${inc.incidentId}`)}
                position="relative"
              >
                <HStack justify="space-between" mb={1}>
                  <HStack>
                    <Badge colorScheme={inc.resolved ? 'green' : 'yellow'}>
                      {inc.resolved ? 'Resolved' : 'Open'}
                    </Badge>
                    {inc.requires_human && (
                      <Badge colorScheme="red" variant="outline">
                        Human review
                      </Badge>
                    )}
                    {inc.escalation_required && (
                      <Badge colorScheme="orange" variant="outline">
                        Escalation
                      </Badge>
                    )}
                  </HStack>
                  <HStack>
                    <Text fontSize="xs" fontFamily="mono">
                      {inc.incidentId}
                    </Text>
                    <Icon as={FiArrowRight} color="gray.500" />
                  </HStack>
                </HStack>
                <HStack gap={4} fontSize="sm">
                  <HStack>
                    <Text fontWeight="medium">Type:</Text>
                    <Text>{inc.incidentType ?? 'Unknown'}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium">Severity:</Text>
                    <Badge colorScheme="red">{inc.severity ?? 'N/A'}</Badge>
                  </HStack>
                  <HStack>
                    <Text fontWeight="medium">Risk:</Text>
                    <Badge colorScheme="orange">
                      {inc.riskScore != null ? inc.riskScore.toFixed(1) : 'N/A'}
                    </Badge>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};
