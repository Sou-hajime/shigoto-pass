import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sou-hajime.github.io/shigoto-pass/"),
  title: "シゴトパス｜仕事の相談から納品までを一本化",
  description: "人手が足りない業務を相談から仕様化、実行体制づくり、検品、納品までまとめるBPOサービス。",
  openGraph: {
    title: "シゴトパス｜仕事を、できる形に。",
    description: "相談から案件設計・実行・検品・納品までを一本化するBPOサービス。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "シゴトパスの業務受託フロー" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "シゴトパス｜仕事を、できる形に。",
    description: "相談から案件設計・実行・検品・納品までを一本化するBPOサービス。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
