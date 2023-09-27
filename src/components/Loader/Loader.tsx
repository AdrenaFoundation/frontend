import React from 'react';
import Lottie from 'react-lottie';

import loader from './animation_llnqetok.json';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loader,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

export default function Loader({
  height = 30,
  width = 120,
}: {
  height?: number;
  width?: number;
}) {
  return <Lottie options={defaultOptions} height={height} width={width} />;
}
