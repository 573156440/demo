import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/docs/mqtt-reboot",
        destination: "/MQTT-reboot告警恢复说明.html",
      },
      {
        source: "/docs/2300plus-install",
        destination: "/智能动环监控单元安装指南2300plus.pdf",
      },
    ];
  },
};

export default nextConfig;
