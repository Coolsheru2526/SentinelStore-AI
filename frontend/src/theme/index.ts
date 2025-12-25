import { createSystem, defaultConfig } from '@chakra-ui/react';

// Define colors
const colors = {
  brand: {
    50: { value: '#e6f7ff' },
    100: { value: '#b3e0ff' },
    200: { value: '#80caff' },
    300: { value: '#4db3ff' },
    400: { value: '#1a9cff' },
    500: { value: '#0080ff' },
    600: { value: '#0066cc' },
    700: { value: '#004d99' },
    800: { value: '#003366' },
    900: { value: '#001a33' },
  },
};

// Create theme configuration
const themeConfig = {
  tokens: {
    colors,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      },
    },
  },
};

// Create and export the system
export const system = createSystem(defaultConfig, { theme: themeConfig });
