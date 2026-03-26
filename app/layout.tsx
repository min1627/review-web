import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "올리브영 리뷰 대시보드",
  description: "올리브영 랭킹/베스트 상품 리뷰 분석 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background">
          <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold text-primary">올리브영 리뷰 대시보드</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    메인
                  </Link>
                  <Link
                    href="/rankings"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    랭킹 비교
                  </Link>
                  <Link
                    href="/reviews"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    리뷰 검색
                  </Link>
                  <Link
                    href="/ad-creative"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    소재 생성
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
