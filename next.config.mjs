import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@libsql/client"],
  // Явный алиас "@/": стабильно работает и при не-ASCII путях (Windows)
  webpack(config) {
    config.resolve.alias["@"] = path.join(root, "src");
    return config;
  },
};
export default nextConfig;
