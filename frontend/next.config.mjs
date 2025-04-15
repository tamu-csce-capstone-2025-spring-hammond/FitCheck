import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  typescript: {
  	ignoreBuildErrors: true,
  },
  images: {
    domains: ['hack-fitcheck.s3.amazonaws.com'],
  },
};

export default nextConfig;
