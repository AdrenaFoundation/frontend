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

export default function Loader() {
  return <Lottie options={defaultOptions} height={30} width={120} />;
}
