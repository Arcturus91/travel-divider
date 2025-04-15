import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/theme/ThemeProvider";

// Load Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Travel Divider - Split Travel Expenses With Friends",
  description: "An application to track and split travel expenses among friends and family",
  keywords: ["travel expenses", "expense splitter", "trip costs", "group travel", "travel budget"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}