/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.SANDBOX_PREVIEW
    ? { allowedDevOrigins: [".monkeycode-ai.live"] }
    : {}),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
