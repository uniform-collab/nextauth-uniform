/**
 * PROVIDERS COMPONENT
 * 
 * Wraps the application with necessary context providers
 * This is where you set up global state, themes, authentication, etc.
 * 
 * KEY CONCEPT - "use client" Directive:
 * 
 * In Next.js, components are SERVER components by default.
 * Server components:
 * - Run only on the server
 * - Cannot use React hooks (useState, useEffect, etc.)
 * - Cannot access browser APIs
 * - More performant (no JavaScript sent to browser)
 * 
 * CLIENT components ("use client"):
 * - Run in the browser
 * - CAN use React hooks
 * - CAN access browser APIs (window, localStorage, etc.)
 * - Required for interactive components
 * 
 * Why "use client" here?
 * SessionProvider needs browser APIs to track authentication state.
 * This is similar to configuring global services/middleware at the application root.
 */

"use client"

import { SessionProvider } from "next-auth/react"

/**
 * Providers Component
 * 
 * Wraps children with NextAuth SessionProvider
 * This makes authentication state available throughout the app
 * 
 * @param children - Child components to wrap
 * @returns Wrapped component tree
 * 
 * Usage:
 * <Providers>
 *   <App />  ← All these can access auth state
 * </Providers>
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

