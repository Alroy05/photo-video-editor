import { useEffect, useRef, useState } from 'react';
import { Box,Text } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';

export default function Canvas({
  mediaItems,
  selectedMediaId,
  setSelectedMediaId,
  handleUpdateMedia,
  isPlaying,
  currentTime,
  videoRefs,
  handleFileChange
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ 
    width: 0, 
    height: 0, 
    x: 0, 
    y: 0,
    right: 0 // Track right edge position
  });

  const handleMouseDown = (e, mediaId) => {
    const target = e.target;
    if (target.classList.contains('resize-handle')) {
      const direction = target.getAttribute('data-direction');
      const media = mediaItems.find(item => item.id === mediaId);
      setResizeDirection(direction);
      setResizeStart({
        width: media.width,
        height: media.height,
        x: media.x,
        y: media.y,
        right: media.x + media.width, // Calculate right edge
        mouseX: e.clientX,
        mouseY: e.clientY
      });
    } else {
      setSelectedMediaId(mediaId);
      const media = mediaItems.find(item => item.id === mediaId);
      setIsDragging(true);
      setDragStart({
        x: e.clientX - media.x,
        y: e.clientY - media.y,
      });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedMediaId) {
      handleUpdateMedia(selectedMediaId, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (resizeDirection && selectedMediaId) {
      const deltaX = e.clientX - resizeStart.mouseX;
      const deltaY = e.clientY - resizeStart.mouseY;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.x;
      let newY = resizeStart.y;

      switch (resizeDirection) {
        // Right side handles
        case 'e':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          break;
        case 'ne':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 'se':
          newWidth = Math.max(50, resizeStart.width + deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
        
        // Left side handles
        case 'w':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newX = resizeStart.x + deltaX;
          break;
        case 'nw':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newX = resizeStart.x + deltaX;
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 'sw':
          newWidth = Math.max(50, resizeStart.width - deltaX);
          newHeight = Math.max(50, resizeStart.height + deltaY);
          newX = resizeStart.x + deltaX;
          break;
        
        // Top/bottom center handles
        case 'n':
          newHeight = Math.max(50, resizeStart.height - deltaY);
          newY = resizeStart.y + (resizeStart.height - newHeight);
          break;
        case 's':
          newHeight = Math.max(50, resizeStart.height + deltaY);
          break;
      }

      handleUpdateMedia(selectedMediaId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      });
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
  }, [isDragging, resizeDirection, selectedMediaId]);

  const getResizeHandlePosition = (direction, width, height) => {
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
  };

  const openRef = useRef(null);

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
      {mediaItems.length === 0 && (
        <Dropzone
          onDrop={(files) => {
            const event = { target: { files } };
            handleFileChange(event);
          }}
          onReject={(files) => console.log('rejected files', files)}
          maxSize={5 * 1024 ** 2}
          accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.mp4, MIME_TYPES.webm]}
          openRef={openRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <Text size="xl" inline>
              Drag images or videos here or click to select files
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Upload up to 5 files (png, jpeg, mp4, webm)
            </Text>
          </div>
        </Dropzone>
      )}


      {mediaItems.map((media) => {
        const shouldShow = isPlaying
          ? currentTime >= media.startTime && currentTime <= media.endTime
          : true;

        if (!shouldShow) return null;

        const isSelected = media.id === selectedMediaId;
        const resizeHandles = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].map((direction) => (
          <Box
            key={direction}
            className="resize-handle"
            data-direction={direction}
            onMouseDown={(e) => handleMouseDown(e, media.id)}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: isSelected ? '#228be6' : '#ccc',
              cursor: `${direction}-resize`,
              ...getResizeHandlePosition(direction, media.width, media.height),
            }}
          />
        ));

        return (
          <Box
            key={media.id}
            onMouseDown={(e) => handleMouseDown(e, media.id)}
            style={{
              position: 'absolute',
              left: media.x,
              top: media.y,
              width: media.width,
              height: media.height,
              border: `2px solid ${isSelected ? '#228be6' : '#ccc'}`,
              cursor: isDragging && isSelected ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              overflow: 'hidden',
              zIndex: isSelected ? 2 : 1,
            }}
          >
            {media.type === 'video' ? (
              <video
                ref={el => videoRefs.current[media.id] = el}
                src={media.url}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                muted
              />
            ) : (
              <img
                src={media.url}
                alt="Uploaded content"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
            {isSelected && resizeHandles}
          </Box>
        );
      })}
    </Box>
  );
}