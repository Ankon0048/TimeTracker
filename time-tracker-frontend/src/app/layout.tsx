import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
// globals.css declares the cascade-layer order, so it must load before Mantine's layered CSS.
import "./globals.css";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "@mantine/tiptap/styles.layer.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeTracker",
  description: "Next.js + Redux Toolkit frontend for TimeTracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <AppHeader />
          <main className="flex-1 w-full pb-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
