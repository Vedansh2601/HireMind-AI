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
      <body className="bg-white text-gray-900">

        {/* NAVBAR */}
        <nav className="border-b px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-lg">HireMind AI</div>

          <div className="flex gap-6 text-sm">
            <a href="/" className="hover:underline">Home</a>
            <a href="/jobs" className="hover:underline">Jobs</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main>{children}</main>

      </body>
    </html>
  );
}