import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "シゴトパス｜仕事から探せる業務マッチング",
  description: "企業と地域の就労支援施設を、依頼したい仕事内容からつなぐ業務マッチングポータル。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
