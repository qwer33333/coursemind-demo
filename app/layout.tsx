import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourseMind Demo",
  description: "基于 DeepSeek API 的课程资料选择题生成系统",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
