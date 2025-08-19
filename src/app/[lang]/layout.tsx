import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
 
import "./globals.css";
import 'antd/dist/reset.css';
import './row.css'
import WrapperProvider from "@/provider/wrapperprovider";
import Script from "next/script";
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/ErrorFallback';
import connectDB from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";

 
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Function to get site title from admin settings
async function getSiteTitle(): Promise<string> {
  try {
    await connectDB();
    const adminSettings = await AdminSettings.findOne();
    return adminSettings?.site?.name || "Adscoun - Earn by Watching";
  } catch (error) {
    console.error('Error fetching site title:', error);
    return "Adscoun - Earn by Watching";
  }
}

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const siteTitle = await getSiteTitle();
  
  return {
    title: siteTitle,
    description: "Earn rewards by watching ads with Adscoun",
  };
}

export default async function RootLayout({  children ,  params  } : {  children: React.ReactNode;  params: Promise<{ lang : string; }>;  } ) {
  const { lang } = await params;
 
 
  return (
    <html lang= {lang} >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
           <Script
            src="https://telegram.org/js/telegram-web-app.js"
            strategy="beforeInteractive"
          />
       
       
       <Script src='//libtl.com/sdk.js' data-zone='9717965' data-sdk='show_9717965' /> 
         
        <ErrorBoundary FallbackComponent={ErrorFallback}>
     
            <WrapperProvider lang={lang}>
            
              {children}
            </WrapperProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
