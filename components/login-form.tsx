/**
 * LOGIN FORM COMPONENT
 * 
 * Client-side form for email/password authentication
 * 
 * Features:
 * - Username/password authentication
 * - Loading states
 * - Error handling
 * - Post-login redirect to callback URL
 */

"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * Handle form submission
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Call NextAuth signIn with credentials
   * 3. On success: redirect to callback URL or home
   * 4. On error: display error message
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Get callback URL from query params or default to home
      const callbackUrl = searchParams.get('callbackUrl') || '/en'
      
      // Attempt sign in with credentials
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false, // Handle redirect manually
      })

      // Check authentication result
      if (result?.error) {
        setError("Invalid username or password. Please try again.")
      } else if (result?.ok) {
        // Success! Redirect to intended destination
        router.push(callbackUrl)
        router.refresh() // Refresh server components
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="username"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In with Credentials"
        )}
      </Button>
    </form>
  )
}
