import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/providers/theme-provider"
import { Providers } from './providers'
import { WebSocketProvider } from '@/providers/websocket-provider'
import RouteProgress from '@/components/route-progress'
import { siteMetadata } from '@/common/meta'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <WebSocketProvider>
              <RouteProgress />
            {children}
            </WebSocketProvider>
            <Toaster />
          </ThemeProvider>
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