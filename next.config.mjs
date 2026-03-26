/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.oliveyoung.co.kr",
      },
    ],
  },
};

export default nextConfig;
