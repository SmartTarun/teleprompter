import React, { useRef, useEffect, useState, useCallback } from 'react';

interface TeleprompterDisplayProps {
  script: string;
  scrollSpeed: number; // Pixels per frame
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  isMirrorMode: boolean;
  isPlaying: boolean;
  voiceScrollDelta: number; // Scroll adjustment from voice commands
  resetScrollTrigger: boolean;
  onScrollPositionChange: (pos: number) => void;
}

const TeleprompterDisplay: React.FC<TeleprompterDisplayProps> = ({
  script,
  scrollSpeed,
  fontSize,
  backgroundColor,
  textColor,
  isMirrorMode,
  isPlaying,
  voiceScrollDelta,
  resetScrollTrigger,
  onScrollPositionChange,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // New refs for easing the scroll position
  const targetScrollPositionRef = useRef(0);
  const smoothScrollPositionRef = useRef(0);

  const [currentScrollTop, setCurrentScrollTop] = useState(0); // This will hold the rounded value for DOM

  const easingFactor = 0.08; // Adjust this value (e.g., 0.05 to 0.15) for more/less aggressive easing

  const animateScroll = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;

    const maxScroll = contentRef.current.scrollHeight - containerRef.current.clientHeight;
    if (maxScroll <= 0) { // If content fits, no scrolling needed
      targetScrollPositionRef.current = 0;
      smoothScrollPositionRef.current = 0;
      if (currentScrollTop !== 0) { // Only update if necessary to avoid unnecessary re-renders
        setCurrentScrollTop(0);
        onScrollPositionChange(0);
      }
      animationFrameId.current = requestAnimationFrame(animateScroll);
      return;
    }

    // 1. Update the ideal, linear target scroll position
    if (isPlaying) {
      targetScrollPositionRef.current += scrollSpeed;
    }
    // Apply voice command delta directly to target for more immediate response
    if (voiceScrollDelta !== 0) {
      targetScrollPositionRef.current += voiceScrollDelta;
    }

    // Clamp the target position within valid scroll boundaries
    targetScrollPositionRef.current = Math.max(0, Math.min(targetScrollPositionRef.current, maxScroll));

    // 2. Smoothly approach the target scroll position using easing
    smoothScrollPositionRef.current += (targetScrollPositionRef.current - smoothScrollPositionRef.current) * easingFactor;

    // Ensure smoothScrollPosition also stays within boundaries, preventing over/undershoot
    smoothScrollPositionRef.current = Math.max(0, Math.min(smoothScrollPositionRef.current, maxScroll));

    // 3. Update the visible scroll position (rounded to pixel for DOM)
    const newScrollTop = Math.round(smoothScrollPositionRef.current);

    if (newScrollTop !== currentScrollTop) {
      setCurrentScrollTop(newScrollTop);
      onScrollPositionChange(newScrollTop);
    }

    animationFrameId.current = requestAnimationFrame(animateScroll);
  }, [currentScrollTop, isPlaying, scrollSpeed, voiceScrollDelta, onScrollPositionChange, easingFactor]);

  useEffect(() => {
    if (isPlaying || voiceScrollDelta !== 0) {
      if (animationFrameId.current === null) {
        animationFrameId.current = requestAnimationFrame(animateScroll);
      }
    } else {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }

    // Clean up on unmount or when playing state changes
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isPlaying, voiceScrollDelta, animateScroll]);

  // Handle script change or reset scroll trigger
  useEffect(() => {
    targetScrollPositionRef.current = 0;
    smoothScrollPositionRef.current = 0;
    setCurrentScrollTop(0);
    onScrollPositionChange(0);
  }, [script, resetScrollTrigger, onScrollPositionChange]); // Reset when script changes or explicit trigger

  // Update actual DOM scroll position
  useEffect(() => {
    if (containerRef.current) {
      // Only set if different to avoid unnecessary DOM writes
      if (containerRef.current.scrollTop !== currentScrollTop) {
        containerRef.current.scrollTop = currentScrollTop;
      }
    }
  }, [currentScrollTop]);

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: backgroundColor, color: textColor }}
      className={`relative flex-1 overflow-y-hidden transition-colors duration-200`}
    >
      <div
        ref={contentRef}
        className={`absolute w-full px-8 py-12 whitespace-pre-wrap transition-transform duration-200 ease-out`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.5,
          minHeight: '100%', // Ensure content takes at least full height
        }}
      >
        <div style={{ transform: isMirrorMode ? 'scaleX(-1)' : 'scaleX(1)' }}>
          {script}
        </div>
      </div>
    </div>
  );
};

export default TeleprompterDisplay;