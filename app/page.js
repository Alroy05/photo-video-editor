"use client";
import { useState, useRef, useEffect } from 'react';
import { AppShell, Button, Group, Stack, Title } from '@mantine/core';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';

export default function EditorPage() {
  const [media, setMedia] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState(null);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [detachAudio, setDetachAudio] = useState(false);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      
      if (file.type.includes('video')) {
        setMediaType('video');
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          setMediaDuration(video.duration);
          setEndTime(video.duration);
        };
      } else {
        setMediaType('image');
        setMediaDuration(60); // Default max duration for images
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setCurrentTime(startTime);
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= endTime) {
            handleStop();
            return endTime;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, endTime]);

  const handleTimelineChange = (values) => {
    setStartTime(values[0]);
    setEndTime(values[1]);
  };

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4}>Edit {mediaType === 'video' ? 'Video' : 'Image'}</Title>
          <Group>
            <Button variant="default">Save your project for later — sign up or log in</Button>
            <Button>Upgrade</Button>
            <Button color="blue">Done</Button>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <LeftPanel
          media={media}
          mediaType={mediaType}
          handleFileChange={handleFileChange}
          width={width}
          height={height}
          startTime={startTime}
          endTime={endTime}
          mediaDuration={mediaDuration}
          isPlaying={isPlaying}
          handlePlay={handlePlay}
          handleStop={handleStop}
          currentTime={currentTime}
          detachAudio={detachAudio}
          setDetachAudio={setDetachAudio}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack gap="md">
          <Canvas
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            width={width}
            height={height}
            setWidth={setWidth}
            setHeight={setHeight}
            isPlaying={isPlaying}
            currentTime={currentTime}
            startTime={startTime}
            endTime={endTime}
            videoRef={videoRef}
            detachAudio={detachAudio}
          />
          <Timeline
            startTime={startTime}
            endTime={endTime}
            currentTime={currentTime}
            duration={mediaDuration}
            onChange={handleTimelineChange}
          />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}