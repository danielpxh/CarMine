import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeContext";
import CookieConsent from "@/components/user/UserPreferences";
import { ContactWidget } from "@/components/contact-widget/ContactWidget";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarMine | Buy and sell cars with confidence",
  description: "Explore vehicle listings and find the right car for your next drive.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClerkProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <CookieConsent />
              <ContactWidget />
            </AuthProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
