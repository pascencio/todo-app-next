import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "./components/header";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App",
  description: "Example of a todo app with Next.js, TypeScript and architecture hexagonal with dependency injection.",
  openGraph: {
    images: [
      {
        url: "https://todo.locallab.app/logo.png",
      },
    ],
    title: "Todo App",
    description: "Example of a todo app with Next.js, TypeScript and architecture hexagonal with dependency injection.",
    url: "https://todo.locallab.app",
    siteName: "Todo App",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          boxSizing: "border-box",
        }}
        cz-shortcut-listen="true"
      ><ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
          <div className="font-sans grid grid-rows-[20px_1fr_20px] gap-10">
            <Header />
            <main className="flex flex-col gap-[32px] row-start-2">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
