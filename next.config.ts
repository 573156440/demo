import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
