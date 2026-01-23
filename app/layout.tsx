import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commit Coach",
  description: "Turn resolutions into consistent progress with AI agents."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
