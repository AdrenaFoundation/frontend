import Lottie from 'lottie-react';

import animationData from './congrats.json';

export const Congrats = () => {
  const renderSettings = {
    preserveAspectRatio: 'xMidYMid slice',
    className: 'lottie-svg-class',
  };

  return (
    <Lottie
      rendererSettings={renderSettings}
      animationData={animationData}
      loop={true}
    />
  );
};
