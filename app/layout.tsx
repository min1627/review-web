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
  title: "뷰티인사이트",
  description: "뷰티 트렌드 & 콘텐츠 스튜디오",
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
                  <span className="text-xl font-bold text-primary">뷰티인사이트</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    홈
                  </Link>
                  <Link
                    href="/rankings"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    트렌드
                  </Link>
                  <Link
                    href="/reviews"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    리뷰
                  </Link>
                  <Link
                    href="/ad-creative"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    스튜디오
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
