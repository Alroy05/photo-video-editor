import { Box, RangeSlider, Text } from '@mantine/core';

export default function Timeline({
  startTime,
  endTime,
  currentTime,
  duration,
  onChange,
}) {
  return (
    <Box>
      <Text size="sm">
        {currentTime.toFixed(1)} / {duration.toFixed(1)}
      </Text>
      <RangeSlider
        value={[startTime, endTime]}
        onChange={onChange}
        min={0}
        max={duration}
        step={0.1}
        minRange={0.1}
        label={(value) => value.toFixed(1)}
        style={{ marginTop: '20px' }}
      />
    </Box>
  );
}