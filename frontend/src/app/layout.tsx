import "./globals.css";

export const metadata = {
  title: "HireMind AI",
  description: "AI-powered hiring platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#10141a] text-[#eceff3]">

        {/* NAVBAR */}
        <nav className="border-b border-[#2b3340] px-6 py-4 flex justify-between items-center">
          <a href="/" className="font-semibold text-lg" style={{ fontFamily: "var(--font-display)" }}>
            HireMind <span className="text-[#e2a33d]">AI</span>
          </a>

          <div className="flex gap-6 text-sm text-[#8b96a3]" style={{ fontFamily: "var(--font-mono)" }}>
            <a href="/" className="hover:text-[#eceff3] transition-colors">Home</a>
            <a href="/jobs" className="hover:text-[#eceff3] transition-colors">Jobs</a>
            <a href="/dashboard" className="hover:text-[#eceff3] transition-colors">Dashboard</a>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main>{children}</main>

      </body>
    </html>
  );
}
