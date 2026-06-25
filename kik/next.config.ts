import path from "path"
import { config } from "dotenv"
import type { NextConfig } from "next"

config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
})

const nextConfig: NextConfig = {
  allowedDevOrigins: ["whoops-library-circular.ngrok-free.dev"],
}

export default nextConfig
