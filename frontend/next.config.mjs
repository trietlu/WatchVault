/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
let apiUploadPattern = null;

try {
  const url = new URL(apiBaseUrl);
  apiUploadPattern = {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    port: url.port,
    pathname: '/uploads/**',
  };
} catch {
  apiUploadPattern = null;
}

const nextConfig = {
  images: {
    remotePatterns: [
      ...(apiUploadPattern ? [apiUploadPattern] : []),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
