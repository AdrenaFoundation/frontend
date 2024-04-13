import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adrena',
    short_name: 'Adrena',
    description: 'Trade at the speed of light with up to 50x leverage',
    start_url: '/',
    display: 'standalone',
    background_color: '#15283b',
    theme_color: '#15283b',
    lang: 'en-US',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/icon-192px.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icon-512px.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
