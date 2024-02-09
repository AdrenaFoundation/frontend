import { Layout, useRive } from '@rive-app/react-canvas';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const RiveAnimation = ({
  src,
  layout,
  className,
}: {
  src: string;
  layout?: Layout;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    layout,

    onLoad: () => {
      setIsLoaded(true);
    },
  });

  const Comp = useMemo(() => {
    return (
      <RiveComponent
        className={twMerge(
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
          'transition-opacity duration-300',
        )}
      />
    );
  }, [RiveComponent, isLoaded, className]);

  return Comp;
};

export default RiveAnimation;
