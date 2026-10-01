/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → pure HTML in dist/ for Cloudflare Workers Assets (see fde-app.toml).
  output: 'export',
  distDir: 'dist',
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false
};

module.exports = nextConfig;
