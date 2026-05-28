import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeMigrate",
  description: "Catch production-killing migrations before they ship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* suppressHydrationWarning is required for Clerk to work properly without throwing React hydration errors */}
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-zinc-950 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}