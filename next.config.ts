import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AWS_API_GATEWAY: process.env.AWS_API_GATEWAY || 'https://your-api-gateway-id.execute-api.your-region.amazonaws.com/Prod',
  },
};

export default nextConfig;