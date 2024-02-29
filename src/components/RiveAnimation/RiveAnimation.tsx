import {
  decodeImage,
  ImageAsset,
  Layout,
  useRive,
} from '@rive-app/react-canvas';
import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useResize } from '@/hooks/useResize';

const RiveAnimation = ({
  animation,
  layout,
  className,
  automaticallyHandleEvents = false,
  stateMachines,
}: {
  animation:
    | 'fred-bg'
    | 'blob-bg'
    | 'mid-monster'
    | 'hero-monster'
    | 'btm-monster';
  layout?: Layout;
  className?: string;
  automaticallyHandleEvents?: boolean;
  stateMachines?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const [assetsLoaded, setAssetsLoaded] = useState(0);
  const [size] = useResize();
  const subFolder = size && size.width > 600 ? 'lg' : 'sm';
  const riveAnimations = [
    {
      name: 'fred-bg',
      src: `./rive/fred-bg/${subFolder}/fred-bg.riv`,
      folder: 'fred-bg',
      totalAssets: 6,
    },
    {
      name: 'blob-bg',
      src: `./rive/blob-bg/${subFolder}/blob-bg.riv`,
      folder: 'blob-bg',
      totalAssets: 3,
    },
    {
      name: 'mid-monster',
      src: `./rive/mid-monster/${subFolder}/mid-monster.riv`,
      folder: 'mid-monster',
      totalAssets: 27,
    },
    {
      name: 'hero-monster',
      src: `./rive/hero-monster/${subFolder}/hero-monster.riv`,
      folder: 'hero-monster',
      totalAssets: 157,
    },
    {
      name: 'btm-monster',
      src: `./rive/btm-monster/${subFolder}/btm-monster.riv`,
      folder: 'btm-monster',
      totalAssets: 51,
    },
  ];

  const currentAnimation = riveAnimations.find((a) => a.name === animation);
  const src = currentAnimation?.src;
  const folder = currentAnimation?.folder;
  const totalAssets = currentAnimation?.totalAssets;

  useEffect(() => {
    if (assetsLoaded === totalAssets) {
      console.log(assetsLoaded, totalAssets);
      setIsLoaded(true);
    }
  }, [assetsLoaded, totalAssets]);

  const getImages = async (asset: ImageAsset) => {
    const img =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require(`../../../public/rive/${folder}/${subFolder}/${asset.name}.webp`).default;

    const arrayBuffer = await fetch(img.src).then((response) =>
      response.arrayBuffer(),
    );

    const image = await decodeImage(new Uint8Array(arrayBuffer));

    asset.setRenderImage(image);

    setAssetsLoaded((prev) => prev + 1);

    // call unref to release any references when no longer needed.
    image.unref();
  };

  const { RiveComponent } = useRive({
    src,
    autoplay: true,
    layout,
    stateMachines,
    automaticallyHandleEvents,
    assetLoader: (asset) => {
      // return true if we want to manage the asset ourselves
      if (asset.isImage) {
        getImages(asset as ImageAsset);
        return true;
      } else {
        return false;
      }
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
