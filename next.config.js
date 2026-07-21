/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Serve o site estático original (public/index.html) na raiz "/",
  // enquanto pages/api/* continua funcionando normalmente como backend.
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
    ];
  },
};

module.exports = nextConfig;
