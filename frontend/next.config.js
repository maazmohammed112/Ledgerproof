/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // When running alongside local Python backend, proxy unhandled backend routes
  async rewrites() {
    // If backend is running locally, external endpoints can proxy
    if (process.env.ENABLE_BACKEND_PROXY === 'true') {
      return [
        {
          source: '/api/backend/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig;
