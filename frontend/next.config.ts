import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "static.chipdip.ru"
            },
            {
                hostname: "www.radetali.ru"
            },
            {
                hostname: "user51928.clients-cdnnow.ru" // krepkom
            },
            {
                hostname: "taggsm.ru"
            }
        ]
    }
  /* config options here */
};

export default nextConfig;
