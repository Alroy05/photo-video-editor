import { Button, Divider, NumberInput, Stack, Text, ScrollArea, Group,Tabs } from '@mantine/core';
import { Settings, PlaySquare, Upload, X } from 'lucide-react';

export default function LeftPanel({
  mediaItems,
  selectedMediaId,
  setSelectedMediaId,
  handleFileChange,
  handleDeleteMedia,
  handleUpdateMedia,
  isPlaying,
  handlePlay,
  handleStop,
  currentTime,
}) {
  const selectedMedia = mediaItems.find(item => item.id === selectedMediaId);

  return (
    <ScrollArea h="calc(100vh - 60px)" offsetScrollbars>
      <Stack gap="md">
        <Tabs defaultValue="adjust">
          <Tabs.List>
            <Tabs.Tab value="adjust" leftSection={<Settings size={14} />}>
              Adjust
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="adjust">
            <Stack gap="md" mt="md">
              {selectedMedia && (
                <>
                  <NumberInput
                    label="Width"
                    value={selectedMedia.width}
                    onChange={(value) => handleUpdateMedia(selectedMediaId, { width: value })}
                    min={50}
                    max={1000}
                  />
                  <NumberInput
                    label="Height"
                    value={selectedMedia.height}
                    onChange={(value) => handleUpdateMedia(selectedMediaId, { height: value })}
                    min={50}
                    max={1000}
                  />
                  <NumberInput
                    label="X Position"
                    value={selectedMedia.x}
                    onChange={(value) => handleUpdateMedia(selectedMediaId, { x: value })}
                  />
                  <NumberInput
                    label="Y Position"
                    value={selectedMedia.y}
                    onChange={(value) => handleUpdateMedia(selectedMediaId, { y: value })}
                  />
                </>
              )}
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
            multiple
          />
          <Button
            component="label"
            htmlFor="media-upload"
            leftSection={<Upload size={14} />}
            variant="default"
            fullWidth
          >
            Upload Media
          </Button>

          {mediaItems.map((item) => (
            <div key={item.id}>
              <Group justify="space-between">
                <Text 
                  size="sm" 
                  style={{ 
                    cursor: 'pointer',
                    fontWeight: selectedMediaId === item.id ? 'bold' : 'normal'
                  }}
                  onClick={() => setSelectedMediaId(item.id)}
                >
                  {item.file.name}
                </Text>
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-xs"
                  onClick={() => handleDeleteMedia(item.id)}
                  leftSection={<X size={14} />}
                >
                  Delete
                </Button>
              </Group>
            </div>
          ))}
        </Stack>

        <Divider />

        {selectedMedia && (
        <Stack gap="md">
          <NumberInput
            label="Start Time"
            value={selectedMedia.startTime}
            onChange={(value) => handleUpdateMedia(selectedMediaId, { 
              startTime: Math.max(0, Math.min(value, selectedMedia.endTime - 0.1))
            })}
            min={0}
            max={selectedMedia.endTime - 0.1}
            step={0.1}
            decimalScale={1}
          />
          <NumberInput
            label="End Time"
            value={selectedMedia.endTime}
            onChange={(value) => handleUpdateMedia(selectedMediaId, { 
              endTime: Math.min(selectedMedia.duration, Math.max(value, selectedMedia.startTime + 0.1))
            })}
            min={selectedMedia.startTime + 0.1}
            max={selectedMedia.duration}
            step={0.1}
            decimalScale={1}
          />
          <Text size="sm">Current: {currentTime.toFixed(1)} / {selectedMedia.duration.toFixed(1)}</Text>
          
        </Stack>
      )}
      </Stack>
    </ScrollArea>
  );
}