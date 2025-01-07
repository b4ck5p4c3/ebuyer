import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "static.chipdip.ru"
            }
        ]
    }
  /* config options here */
};

export default nextConfig;
