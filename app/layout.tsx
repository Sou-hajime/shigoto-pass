import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sou-hajime.github.io/shigoto-pass/"),
  title: "シゴトパス｜手が回らない仕事を、相談から納品まで",
  description: "データ入力、書類の電子化、商品登録、封入・梱包などを、相談から作業の手配、進行確認、納品までまとめてお任せいただけるサービスです。",
  openGraph: {
    title: "シゴトパス｜手が回らない仕事を、相談から納品まで。",
    description: "内容が固まっていない段階から相談でき、見積り、作業の手配、進行確認、納品まで担当窓口が対応します。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "シゴトパスの業務受託フロー" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "シゴトパス｜手が回らない仕事を、相談から納品まで。",
    description: "内容が固まっていない段階から相談でき、見積り、作業の手配、進行確認、納品まで担当窓口が対応します。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
