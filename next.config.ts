import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@circle-fin/developer-controlled-wallets"],
};

export default config;
