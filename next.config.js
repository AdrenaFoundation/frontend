/** @type {import('next').NextConfig} */

module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,

    async redirects() {
      return [
        {
          source: '/genesis',
          destination: '/trade',
          permanent: true,
        },
      ];
    },

    webpack: (config) => {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          path: false,
          os: false,
        },
      };
      return config;
    },
  };
};
