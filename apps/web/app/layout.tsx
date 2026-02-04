import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Multi-agent task management dashboard for OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
