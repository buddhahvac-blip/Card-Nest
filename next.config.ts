import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {deviceSizes:[640,750,960,1024,1280,1536,1920], qualities:[75,90,95], minimumCacheTTL:604800, remotePatterns:[{protocol:"https",hostname:"cdn.openart.ai",pathname:"/openart-uploads/**"}]},
  reactStrictMode: true,
  async headers() {
    const csp=[
      "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
      "form-action 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:", "font-src 'self' data:", "connect-src 'self' https://*.neonauth.c-7.us-east-2.aws.neon.tech",
      "frame-src 'none'", "upgrade-insecure-requests"
    ].join('; ');
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" }
        ]
      }
    ];
  }
};

export default nextConfig;
