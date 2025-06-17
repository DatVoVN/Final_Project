"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Header2 from "@/components/Header2";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/authContext";
import { Toaster } from "react-hot-toast";
import ChatbotWidget from "@/components/ChatbotWidget";
import CvSuggestJobs from "@/components/CVSuggestJobs/CvSuggestJobs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const noLayoutRoutes = ["/auth/loginEmployers", "/auth/registerEmployers"];

  const isEmployerRoute = pathname.startsWith("/employer");
  const isAdminRoute = pathname.startsWith("/admin");
  const isNoLayoutRoute = noLayoutRoutes.includes(pathname);

  const shouldHideAnyHeader = isNoLayoutRoute || isAdminRoute;
  const shouldHideFooter = isEmployerRoute || isAdminRoute || isNoLayoutRoute;

  return (
    <html lang="en" className="mdl-js">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster position="top-right" reverseOrder={false} />
            {!shouldHideAnyHeader && (isEmployerRoute ? <></> : <Header />)}

            <main className="flex-1">{children}</main>
            <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end space-y-4">
              <ChatbotWidget />
              <CvSuggestJobs />
            </div>
            {!shouldHideFooter && <Footer />}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
