/**
 * LOGIN PAGE
 * 
 * Public authentication page where users can:
 * - Sign in with OAuth providers (GitHub, Google, etc.)
 * - Sign in with email/password credentials
 * 
 * Features:
 * - Automatic redirect if already logged in
 * - Callback URL support for post-login navigation
 * - Demo credentials display (for testing)
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLayout } from "@/components/layout/page-layout"
import { DemoCredentialsCard } from "@/components/cards/demo-credentials-card"
import { OAuthProviders } from "@/components/auth/oauth-providers"
import { ShieldCheck } from "lucide-react"

/**
 * Login Page Component
 * 
 * @param searchParams - URL search parameters (includes callbackUrl)
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);
  
  // If already logged in, redirect to callback URL or home
  if (session) {
    const params = await searchParams;
    const callbackUrl = params?.callbackUrl || '/en';
    redirect(callbackUrl);
  }
  
  // Get callback URL for post-login redirect
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || '/en';
  
  return (
    <PageLayout centered className="p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth providers (GitHub, Google, etc.) */}
            <OAuthProviders callbackUrl={callbackUrl} />
            
            {/* Email/Password credentials form */}
            <LoginForm />
          </CardContent>
        </Card>

        {/* Demo credentials card */}
        <DemoCredentialsCard />
      </div>
    </PageLayout>
  )
}
