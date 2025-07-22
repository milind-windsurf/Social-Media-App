import { Geist, Geist_Mono, Righteous } from "next/font/google";
import "./globals.css";
import { PostsProvider } from '@/context/PostsContext';
import { MainLayout } from '@/components/MainLayout';
import { ReactNode } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const righteous = Righteous({
  weight: ["400"],
  variable: "--font-righteous",
  subsets: ["latin"],
});

export const metadata = {
  title: "Social Media App",
  description: "A Twitter-like social media timeline app built with Next.js",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${righteous.variable} antialiased`}
      >
        <PostsProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </PostsProvider>
      </body>
    </html>
  );
}
