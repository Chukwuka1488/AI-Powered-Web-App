// src/app/layout.tsx
import type { Metadata } from "next";
// import localFont from "next/font/local";
// import { Roboto } from "next/font/google";
import { Lato } from "next/font/google";
import { Sour_Gummy } from "next/font/google";
// import Chat from "@/app/chat/Chat";
import "./globals.css";
import Providers from "../components/chat/Providers";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

const lato = Lato({
  weight: "400",
  subsets: ["latin"],
});

const sourGummy = Sour_Gummy({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookBuddy",
  description: "Your Bookstore for fantasy and mystery novels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body
          suppressHydrationWarning={true}
          // className={`${geistSans.variable} ${geistMono.variable} ${roboto.className} ${sourGummy.className} antialiased`}
          className={`${sourGummy.className} ${lato.className} `}
        >
          {children}
        </body>
      </Providers>
    </html>
  );
}
