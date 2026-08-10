import { fileURLToPath } from 'url';
import path from 'path';

// Resolve the true filesystem path of this config file (correct casing, no symlinks).
// On Windows, process.cwd() may return a different casing than the real folder name
// (e.g. "fixng-web-version" vs "Fixng-web-version"). Webpack treats these as two
// separate directories and loads every Next.js module twice, breaking React contexts.
// Pinning config.context to __dirname (derived from import.meta.url) forces webpack
// to use one consistent root path regardless of how the terminal reached this folder.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  webpack(config) {
    // Force a single consistent root path so webpack never resolves the same
    // physical module via two different casings of the project directory.
    config.context = __dirname;
    return config;
  },
};

export default nextConfig;
