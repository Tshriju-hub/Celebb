/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Handle canvas dependency
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
    };

    return config;
  },
  // Enable static file serving
  async rewrites() {
    return [
      {
        source: '/pdf-worker/:path*',
        destination: '/pdf-worker/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 