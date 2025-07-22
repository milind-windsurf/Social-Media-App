import { Poppins, Space_Grotesk, Righteous, Outfit } from "next/font/google";
import "./globals.css";
import { PostsProvider } from '@/context/PostsContext';
import { MainLayout } from '@/components/MainLayout';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const righteous = Righteous({
  weight: ["400"],
  variable: "--font-righteous",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata = {
  title: "Social Media App",
  description: "A Twitter-like social media timeline app built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} ${righteous.variable} ${outfit.variable} antialiased`}
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
