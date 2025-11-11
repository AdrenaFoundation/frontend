import { useCallback, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

interface UseChatWindowResizeOptions {
  defaultHeightPercentage?: number;
  minHeight?: number;
  isOpen?: boolean;
  cookieName?: string;
}

interface UseChatWindowResizeReturn {
  height: number;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const useChatWindowResize = ({
  defaultHeightPercentage = 0.35,
  minHeight = 250,
  isOpen = true,
  cookieName = 'chat-height',
}: UseChatWindowResizeOptions = {}): UseChatWindowResizeReturn => {
  const [cookies, setCookie] = useCookies([cookieName]);
  const storedHeight = cookies[cookieName];
  const [height, setHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return (
        storedHeight || Math.round(window.innerHeight * defaultHeightPercentage)
      );
    }
    return 400; // Fallback for SSR
  });

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (!isDragging) {
        if (storedHeight) {
          setHeight(parseInt(storedHeight, 10));
        } else {
          setHeight(Math.round(window.innerHeight * defaultHeightPercentage));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging, storedHeight, defaultHeightPercentage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !isOpen) return;

      const newHeight = window.innerHeight - e.clientY;
      const clampedHeight = Math.min(Math.max(newHeight, minHeight));
      setHeight(clampedHeight);
    },
    [isDragging, isOpen, minHeight],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setCookie(cookieName, height, { path: '/' });
    }
    setIsDragging(false);
  }, [isDragging, setCookie, height, cookieName]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    height,
    isDragging,
    handleMouseDown,
  };
};

export default useChatWindowResize;
