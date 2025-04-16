import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AWS_API_GATEWAY:
      process.env.AWS_API_GATEWAY ||
      "https://zlgl5zy753.execute-api.eu-west-3.amazonaws.com/Prod",
  },
};

export default nextConfig;
