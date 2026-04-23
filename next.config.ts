import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tiptap/react", "@tiptap/starter-kit"],
  },
};

export default nextConfig;
