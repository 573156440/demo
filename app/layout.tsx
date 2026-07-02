import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "技术文档",
  description: "内部与客户共享的技术说明文档",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
