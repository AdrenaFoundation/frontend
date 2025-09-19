import React from 'react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  speed?: number; // Animation duration in seconds
  className?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'; // Predefined gap sizes
  fadeEdges?: boolean; // Enable/disable gradient fade edges
  fadeColor?: string; // Custom fade color (defaults to current background)
}

export default function InfiniteScroll({
  children,
  speed = 25,
  className = '',
  gap = 'md',
  fadeEdges = true,
  fadeColor = 'from-secondary to-transparent',
}: InfiniteScrollProps) {
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-5', // Default
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const paddingClasses = {
    none: '',
    sm: 'pr-2',
    md: 'pr-5', // Default
    lg: 'pr-8',
    xl: 'pr-12',
  };

  const gapClass = gapClasses[gap];
  const paddingClass = paddingClasses[gap];

  return (
    <div className={`relative flex overflow-x-hidden ${className}`}>
      {/* Fade edges */}
      {fadeEdges && (
        <>
          <div
            className={`absolute left-0 top-0 w-12 h-full bg-gradient-to-r ${fadeColor} pointer-events-none z-20`}
          />
          <div
            className={`absolute right-0 top-0 w-12 h-full bg-gradient-to-l ${fadeColor} pointer-events-none z-20`}
          />
        </>
      )}

      {/* First marquee */}
      <div
        className={`flex ${gapClass} whitespace-nowrap animate-marquee ${paddingClass}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>

      {/* Second marquee */}
      <div
        className={`absolute top-0 flex ${gapClass} whitespace-nowrap animate-marquee2 ${paddingClass}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}
