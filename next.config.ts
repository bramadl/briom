import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: process.env.NGROK_FREE_TUNNEL
		? [process.env.NGROK_FREE_TUNNEL]
		: undefined,
	reactCompiler: true,
};

export default nextConfig;
