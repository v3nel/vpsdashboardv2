import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPS Ops Dashboard",
  description: "Tableau de bord pour piloter un VPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
