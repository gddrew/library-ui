import type { NextConfig } from 'next';

const backendOrigin =
  process.env.LIBRARY_BACKEND_ORIGIN || 'http://127.0.0.1:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    if (!/^https?:\/\//.test(backendOrigin)) {
      throw new Error(
        `Invalid LIBRARY_BACKEND_ORIGIN: "${backendOrigin}". Expected http(s) URL.`
      );
    }
    return [
      {
        source: '/backend/:path*',
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
