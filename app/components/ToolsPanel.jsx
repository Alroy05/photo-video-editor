import { Box, Button, Divider, Stack, Text } from '@mantine/core';
import { Search } from 'lucide-react';

export default function ToolsPanel() {
  return (
    <Stack gap="md">
      <Box>
        <Text size="sm">Search</Text>
        <Text size="xs" c="dimmed">WebSocket in Drag & Drop & Color</Text>
      </Box>

      <Divider />

      <Stack gap="xs">
        <Text size="sm">1. Happy</Text>
        <Text size="sm">2. Legend</Text>
        <Text size="sm">3. Stop</Text>
        <Text size="sm">4. Learn</Text>
        <Text size="sm">5. Write</Text>
        <Text size="sm">6. Answer</Text>
      </Stack>

      <Divider />

      <Text size="sm">Sign up of our service to us to help you return</Text>
      <Text size="sm">Please choose to add my partner.</Text>

      <Divider />

      <Stack gap="xs">
        <Text size="sm">Magic Tools</Text>
        <Text size="sm">Animation</Text>
        <Text size="sm">Transitions</Text>
      </Stack>
    </Stack>
  );
}