import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["passkit-generator", "jsonwebtoken"],
};

export default nextConfig;
