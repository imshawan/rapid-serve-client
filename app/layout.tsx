import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/providers/theme-provider"
import { Providers } from './providers'
import { WebSocketProvider } from '@/providers/websocket-provider'
import RouteProgress from '@/components/route-progress'
import { siteMetadata } from '@/common/meta'
import GoogleAnalytics from '@/components/google-analytics'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* GA4 - gtag.js */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6Y04YMHPN1"
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-6Y04YMHPN1');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <WebSocketProvider>
              <RouteProgress />
            {children}
            </WebSocketProvider>
            <Toaster />
          </ThemeProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}

export function generateViewport() {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
  }
}