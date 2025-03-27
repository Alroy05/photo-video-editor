"use client";
import { useState, useRef, useEffect } from 'react';
import { AppShell, Button, Group, Stack, Title } from '@mantine/core';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';

export default function EditorPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef(null);
  const videoRefs = useRef({});

  const selectedMedia = mediaItems.find(item => item.id === selectedMediaId) || null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newMediaItems = files.map(file => {
        const url = URL.createObjectURL(file);
        const type = file.type.includes('video') ? 'video' : 'image';
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        
        const newItem = {
          id,
          file,
          url,
          type,
          width: 300,
          height: 200,
          x: 100,
          y: 100,
          startTime: 0,
          endTime: type === 'video' ? 0 : 5, // Will be updated for videos
          duration: type === 'video' ? 0 : 60,
          visible: true
        };

        if (type === 'video') {
          const video = document.createElement('video');
          video.src = url;
          video.onloadedmetadata = () => {
            setMediaItems(prev => prev.map(item => 
              item.id === id ? { 
                ...item, 
                endTime: video.duration,
                duration: video.duration 
              } : item
            ));
          };
        }

        return newItem;
      });

      setMediaItems(prev => [...prev, ...newMediaItems]);
      if (!selectedMediaId && newMediaItems.length > 0) {
        setSelectedMediaId(newMediaItems[0].id);
      }
    }
  };

  const handleDeleteMedia = (id) => {
    setMediaItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      if (selectedMediaId === id) {
        setSelectedMediaId(newItems.length > 0 ? newItems[0].id : null);
      }
      return newItems;
    });
    URL.revokeObjectURL(mediaItems.find(item => item.id === id)?.url);
  };

  const handleUpdateMedia = (id, updates) => {
    setMediaItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentTime(selectedMedia?.startTime || 0);
    
    // Play all videos that should be visible at startTime
    mediaItems.forEach(item => {
      if (item.type === 'video' && videoRefs.current[item.id]) {
        videoRefs.current[item.id].currentTime = item.startTime;
        if (currentTime >= item.startTime && currentTime <= item.endTime) {
          videoRefs.current[item.id].play();
        } else {
          videoRefs.current[item.id].pause();
        }
      }
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    // Pause all videos
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef) videoRef.pause();
    });
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          
          // Update video playback based on current time
          mediaItems.forEach(item => {
            if (item.type === 'video' && videoRefs.current[item.id]) {
              const shouldBeVisible = newTime >= item.startTime && newTime <= item.endTime;
              if (shouldBeVisible && videoRefs.current[item.id].paused) {
                videoRefs.current[item.id].play();
              } else if (!shouldBeVisible && !videoRefs.current[item.id].paused) {
                videoRefs.current[item.id].pause();
              }
            }
          });

          if (selectedMedia && newTime >= selectedMedia.endTime) {
            handleStop();
            return selectedMedia.endTime;
          }
          return newTime;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, mediaItems, selectedMedia]);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>Editor</Title>
          <Group>
            <Button variant="default">Save your project for later — sign up or log in</Button>
            <Button>Upgrade</Button>
            <Button color="blue">Done</Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <LeftPanel
          mediaItems={mediaItems}
          selectedMediaId={selectedMediaId}
          setSelectedMediaId={setSelectedMediaId}
          handleFileChange={handleFileChange}
          handleDeleteMedia={handleDeleteMedia}
          handleUpdateMedia={handleUpdateMedia}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handleStop={handleStop}
          currentTime={currentTime}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="md">
          <Canvas
            mediaItems={mediaItems}
            selectedMediaId={selectedMediaId}
            setSelectedMediaId={setSelectedMediaId}
            handleUpdateMedia={handleUpdateMedia}
            isPlaying={isPlaying}
            currentTime={currentTime}
            videoRefs={videoRefs}
          />
          {selectedMedia && (
            <Timeline
              startTime={selectedMedia.startTime}
              endTime={selectedMedia.endTime}
              currentTime={currentTime}
              duration={selectedMedia.duration}
              onChange={(values) => handleUpdateMedia(selectedMediaId, {
                startTime: values[0],
                endTime: values[1]
              })}
            />
          )}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}