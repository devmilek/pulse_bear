import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/",
        permanent: false,
      },
      {
        source: "/docs/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

export default withMDX(config);
