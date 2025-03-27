import { Box, RangeSlider, Text, Group } from '@mantine/core';

export default function Timeline({
  startTime,
  endTime,
  currentTime,
  duration,
  onChange,
}) {
  return (
    <Box style={{ padding: '0 10px' }}>
      <Group justify="center" mb="sm">
      </Group>
      <Text size="sm" style={{ textAlign: 'center', marginBottom: 8 }}>
        {currentTime.toFixed(1)} / {endTime.toFixed(1)}
      </Text>
      <RangeSlider
        value={[startTime, endTime]}
        onChange={onChange}
        min={0}
        max={duration}
        step={0.1}
        minRange={0.1}
        label={(value) => value.toFixed(1)}
        style={{ marginTop: '10px' }}
      />
    </Box>
  );
}