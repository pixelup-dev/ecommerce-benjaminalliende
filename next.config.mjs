/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXT_PUBLIC_SITE_KEY_PUBLIC: process.env.NEXT_PUBLIC_SITE_KEY_PUBLIC,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    RECAPTCHA_PUBLIC_SITE_KEY: process.env.RECAPTCHA_PUBLIC_SITE_KEY,
  },
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)", // Aplica a todas las rutas
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow", // Cambia esto según tus necesidades
          },
        ],
      },
    ];
  },
  images: {
    domains: ["mcwni7uydbmr5rxa.public.blob.vercel-storage.com"],
  },
};

export default nextConfig;
