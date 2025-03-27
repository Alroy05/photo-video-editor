import { useEffect, useRef, useState } from 'react';
import { Box } from '@mantine/core';

export default function Canvas({
  mediaUrl,
  mediaType,
  width,
  height,
  setWidth,
  setHeight,
  isPlaying,
  currentTime,
  startTime,
  endTime,
  videoRef,
  detachAudio,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const shouldShowMedia = isPlaying
    ? currentTime >= startTime && currentTime <= endTime
    : true;

  const handleMouseDown = (e) => {
    const target = e.target;
    if (target.classList.contains('resize-handle')) {
      const direction = target.getAttribute('data-direction');
      setResizeDirection(direction);
      setStartSize({ width, height });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (resizeDirection) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newWidth = width;
      let newHeight = height;

      switch (resizeDirection) {
        case 'n':
          newHeight = Math.max(50, startSize.height - deltaY);
          break;
        case 's':
          newHeight = Math.max(50, startSize.height + deltaY);
          break;
        case 'e':
          newWidth = Math.max(50, startSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(50, startSize.width - deltaX);
          break;
        case 'ne':
          newWidth = Math.max(50, startSize.width + deltaX);
          newHeight = Math.max(50, startSize.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(50, startSize.width - deltaX);
          newHeight = Math.max(50, startSize.height - deltaY);
          break;
        case 'se':
          newWidth = Math.max(50, startSize.width + deltaX);
          newHeight = Math.max(50, startSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(50, startSize.width - deltaX);
          newHeight = Math.max(50, startSize.height + deltaY);
          break;
      }

      setWidth(newWidth);
      setHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, resizeDirection]);

  if (!mediaUrl) {
    return (
      <Box
        style={{
          width: '100%',
          height: '400px',
          border: '1px dashed #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Upload an image or video to begin editing</p>
      </Box>
    );
  }

  const resizeHandles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].map((direction) => (
    <Box
      key={direction}
      className="resize-handle"
      data-direction={direction}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        width: '10px',
        height: '10px',
        backgroundColor: '#228be6',
        cursor: `${direction}-resize`,
        ...getResizeHandlePosition(direction),
      }}
    />
  ));

  function getResizeHandlePosition(direction) {
    const positions = {
      n: { top: 0, left: '50%', transform: 'translateX(-50%)' },
      ne: { top: 0, right: 0 },
      e: { top: '50%', right: 0, transform: 'translateY(-50%)' },
      se: { bottom: 0, right: 0 },
      s: { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
      sw: { bottom: 0, left: 0 },
      w: { top: '50%', left: 0, transform: 'translateY(-50%)' },
      nw: { top: 0, left: 0 },
    };
    return positions[direction];
  }

  return (
    <Box
      style={{
        width: '100%',
        height: '400px',
        border: '1px dashed #ccc',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {shouldShowMedia && (
        <Box
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: width,
            height: height,
            border: '2px solid #228be6',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            overflow: 'hidden',
          }}
        >
          {mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              autoPlay={isPlaying}
              muted={detachAudio}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Uploaded content"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
          {resizeHandles}
        </Box>
      )}
    </Box>
  );
}