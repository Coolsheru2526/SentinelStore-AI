import { 
  Box, 
  SimpleGrid, 
  Text, 
  Card,
  Heading, 
  Button,
  Icon
} from '@chakra-ui/react';
import { 
  FiAlertTriangle, 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign 
} from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, icon: IconComponent, color }: StatCardProps) => {
  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">{title}</Heading>
      </Card.Header>
      <Card.Body>
        <Box display="flex" alignItems="center">
          <Icon as={IconComponent} color={color} boxSize={8} mr={4} />
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

export const Dashboard = () => {
  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Dashboard Overview</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
        <StatCard
          title="Total Alerts"
          value="24"
          icon={FiAlertTriangle}
          color="red.500"
        />
        <StatCard
          title="Total Products"
          value="156"
          icon={FiShoppingBag}
          color="blue.500"
        />
        <StatCard
          title="Active Customers"
          value="89"
          icon={FiUsers}
          color="green.500"
        />
        <StatCard
          title="Revenue"
          value="$12,450"
          icon={FiDollarSign}
          color="purple.500"
        />
      </SimpleGrid>

      <Card.Root mb={6}>
        <Card.Header>
          <Heading size="md">Recent Activity</Heading>
        </Card.Header>
        <Card.Body>
          <Text>No recent activity to display</Text>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Heading size="md">Quick Actions</Heading>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Button colorScheme="red">
              View Alerts
            </Button>
            <Button colorScheme="blue">
              Manage Products
            </Button>
            <Button colorScheme="green">
              View Customers
            </Button>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
