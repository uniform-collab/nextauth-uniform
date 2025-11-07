/**
 * ROOT LAYOUT - Application Shell
 * 
 * This is the root layout that wraps ALL pages in your application.
 * It runs on every route and provides:
 * - HTML structure (<html>, <body>)
 * - Global styles
 * - Global providers (auth, themes, CMS)
 * - Fonts
 * 
 * Everything rendered in your app is nested inside this layout
 * Similar to a master template or base layout in other frameworks
 * 
 * IMPORTANT CONCEPTS:
 * 
 * 1. METADATA:
 *    Static metadata for SEO (title, description)
 *    Gets rendered in <head> tag
 * 
 * 2. FONT OPTIMIZATION:
 *    Next.js automatically optimizes Google Fonts
 *    Fonts are downloaded at build time (not runtime)
 * 
 * 3. PROVIDER PATTERN:
 *    Multiple wrappers providing context/state to child components
 *    Similar to global middleware or dependency injection
 * 
 * 4. {children}:
 *    React's way of rendering child components
 *    The slot where page content gets inserted
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { UniformContext } from "@uniformdev/canvas-next-rsc"
import { UniformClientContext } from "@/uniform/clientContext"
import './globals.css'

/**
 * FONT CONFIGURATION
 * 
 * Next.js optimizes font loading automatically:
 * 1. Downloads fonts at build time
 * 2. Self-hosts them (no Google CDN requests at runtime)
 * 3. Generates CSS variables for use in Tailwind
 * 
 * Benefits:
 * - Faster page loads (no external requests)
 * - No layout shift (fonts load immediately)
 * - Better privacy (no Google tracking)
 */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

/**
 * PAGE METADATA
 * 
 * Static metadata exported from layout/page components
 * Next.js merges this into <head> tag
 * 
 * Can also be dynamic - see Next.js docs for generateMetadata()
 */
export const metadata: Metadata = {
  title: 'Next.js + Uniform Canvas + Auth',
  description: 'Modern content management with authentication',
}

/**
 * ROOT LAYOUT COMPONENT
 * 
 * Wraps entire application with providers and global structure
 * 
 * Structure (outermost to innermost):
 * 1. <html> - Root HTML element
 * 2. <body> - Body with fonts and styles
 * 3. <Providers> - NextAuth session provider
 * 4. <UniformContext> - Uniform Canvas context
 * 5. {children} - Your page content goes here
 * 
 * @param children - Page content to render (comes from page.tsx files)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50`}>
        {/* Authentication provider - makes session available app-wide */}
        <Providers>
          {/* Uniform Canvas provider - enables visual editing */}
          <UniformContext clientContextComponent={UniformClientContext}>
            <div className="flex-1 flex flex-col">
              {/* Your page content renders here */}
              {children}
            </div>
          </UniformContext>
        </Providers>
        
        {/* Analytics tracking */}
        <Analytics />
      </body>
    </html>
  )
}
