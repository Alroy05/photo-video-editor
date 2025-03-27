import { Button, Divider, NumberInput, Stack, Tabs, Text, Checkbox } from '@mantine/core';
import { Settings, PlaySquare, Image, Volume2, VolumeX } from 'lucide-react';

export default function LeftPanel({
  media,
  mediaType,
  handleFileChange,
  width,
  height,
  startTime,
  endTime,
  mediaDuration,
  isPlaying,
  handlePlay,
  handleStop,
  currentTime,
  detachAudio,
  setDetachAudio,
}) {
  return (
    <Stack gap="md">
      <Tabs defaultValue="adjust">
        <Tabs.List>
          <Tabs.Tab value="adjust" leftSection={<Settings size={14} />}>
            Adjust
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="adjust">
          <Stack gap="md" mt="md">
            <NumberInput
              label="Width"
              value={width}
              disabled
              min={50}
              max={1000}
            />
            <NumberInput
              label="Height"
              value={height}
              disabled
              min={50}
              max={1000}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Divider />

      <Stack gap="md">
        <Text size="sm">Media</Text>
        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Button
          component="label"
          htmlFor="media-upload"
          leftSection={<Image size={14} />}
          variant="default"
        >
          Replace {mediaType === 'video' ? 'Video' : 'Image'}
        </Button>
        {media && <Text size="sm">{media.name}</Text>}
        {mediaType === 'video' && (
          <Checkbox
            label="Detach Audio"
            checked={detachAudio}
            onChange={(e) => setDetachAudio(e.currentTarget.checked)}
            leftSection={detachAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
          />
        )}
      </Stack>

      <Divider />

      <Stack gap="md">
        <Text size="sm">Split Download Section ({startTime.toFixed(1)} - {endTime.toFixed(1)})</Text>
        <Text size="sm">{currentTime.toFixed(1)} / {mediaDuration.toFixed(1)}</Text>
        {isPlaying ? (
          <Button onClick={handleStop}>Stop</Button>
        ) : (
          <Button onClick={handlePlay}>Play</Button>
        )}
      </Stack>
    </Stack>
  );
}