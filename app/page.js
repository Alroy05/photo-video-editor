"use client";
import { useState, useRef, useEffect } from 'react';
import { AppShell, Button, Group, Stack, Title } from '@mantine/core';
import { LayoutTemplate, Play, Pause, CircleStopIcon, Check, Zap } from 'lucide-react';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';

export default function EditorPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
    if (isPaused) {
      // Resume playback
      setIsPaused(false);
      setIsPlaying(true);
      
      // Resume all videos that should be visible
      mediaItems.forEach(item => {
        if (item.type === 'video' && videoRefs.current[item.id]) {
          if (currentTime >= item.startTime && currentTime <= item.endTime) {
            videoRefs.current[item.id].play();
          }
        }
      });
    } else {
      // Start fresh playback
      setIsPlaying(true);
      setIsPaused(false);
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
    }
  };
  
  const handlePause = () => {
    setIsPaused(true);
    setIsPlaying(false);
    // Pause all videos
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef) videoRef.pause();
    });
    clearInterval(timerRef.current);
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    // Pause all videos and reset to start
    Object.values(videoRefs.current).forEach(videoRef => {
      if (videoRef) {
        videoRef.pause();
        videoRef.currentTime = 0;
      }
    });
    clearInterval(timerRef.current);
    setCurrentTime(0);
  };

  useEffect(() => {
    if (isPlaying && !isPaused) {
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
  }, [isPlaying, isPaused, mediaItems, selectedMedia]);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
        <Group gap={8} align="center" style={{ lineHeight: 1 }}>
          <LayoutTemplate 
            size={26} 
            style={{ 
              color: '#228be6',
              marginRight: 4 
            }} 
          />
          <Title 
            order={3} 
            style={{
              background: 'linear-gradient(to right, #228be6, #7950f2)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontWeight: 700,
              letterSpacing: 0.5,
              margin: 0
            }}
          >
            CanvasFlow
          </Title>
        </Group>
          <Group>
            <Button variant="default">Save your project for later — sign up or log in</Button>
            <Button style={{
              background: 'linear-gradient(to right, #228be6, #7950f2)',
            }}><Zap  size={16} strokeWidth={2} /><span style={{marginLeft:"4px"}}>Upgrade</span></Button>
            <Button color="blue" style={{
              background: 'linear-gradient(to right, #228be6, #7950f2)',
            }}><Check
            size={16} strokeWidth={2}
             /><span style={{ marginLeft: "4px"}}>Done</span></Button>
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
            handleFileChange={handleFileChange}
          />
          {selectedMedia && (
            <>
            <Group justify="center">
              {isPlaying ? (
                <>
                  <Button 
                    onClick={handlePause}
                    leftSection={<Pause size={16} />}
                    variant="filled"
                    color="yellow"
                  >
                    Pause
                  </Button>
                  <Button 
                    onClick={handleStop}
                    leftSection={<CircleStopIcon size={16} />}
                    variant="filled"
                    color="red"
                  >
                    Stop
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handlePlay}
                  leftSection={isPaused ? <Play size={16} /> : <Play size={16} />}
                  variant="filled"
                  style={{
                    background: 'linear-gradient(to right, #228be6, #7950f2)',
                  }}
                >
                  {isPaused ? 'Resume' : 'Play'}
                </Button>
              )}
            </Group>
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
            </>
          )}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}