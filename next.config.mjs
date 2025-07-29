/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
