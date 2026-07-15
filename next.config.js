/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sql.js", "anki-apkg-export"],
  },
};
module.exports = nextConfig;