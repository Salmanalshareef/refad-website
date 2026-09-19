import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Every upload in this app is a Server Action: profile photos, board
      // photos, initiative icons and files, request attachments. The default
      // cap is 1MB, which a photo straight off a phone exceeds, and the action
      // fails before any of our own validation runs.
      //
      // The limit covers the raw multipart body, so the usable file size is a
      // little under this. Client-side checks reject oversized files first and
      // give a readable message instead of a failed request.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
