import Lottie from 'lottie-react';
import React from 'react';

import loader from './animation_llnqetok.json';

export default function Loader({
  height = 30,
  width = 120,
  className,
}: {
  height?: number;
  width?: number;
  className?: string;
}) {
  return (
    <div className={className ?? ''}>
      <Lottie
        animationData={loader}
        loop={true}
        autoplay={true}
        style={{ height, width }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice'
        }}
      />
    </div>
  );
}
