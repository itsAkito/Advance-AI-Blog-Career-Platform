import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata = {
  title: "AiBlog - AI-Powered Blogging & Career Platform",
  description: "A premium digital ecosystem where generative intelligence meets professional journalism.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className={`dark scroll-smooth ${inter.variable} ${manrope.variable}`}>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        </head>
        <body className="font-body selection:bg-primary/30 overflow-x-hidden">
          <AuthProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}