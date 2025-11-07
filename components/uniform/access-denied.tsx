/**
 * ACCESS DENIED COMPONENT
 * 
 * A Uniform Canvas component that displays access denied messaging
 * with appropriate actions based on user authentication state.
 * 
 * This component is CMS-managed, allowing editors to customize:
 * - Title and descriptions
 * - Messaging for different scenarios
 * - Visual styling through Uniform
 */

import { ComponentProps, UniformText } from "@uniformdev/canvas-next-rsc/component";
import type { CompositionContext } from "@uniformdev/canvas-next-rsc/component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

/**
 * Component parameter types
 * Define what editors can configure in Uniform Canvas
 */
type AccessDeniedProps = ComponentProps<{
  title: string;
  description: string;
  messageAnonymous: string;
  messageUsers: string;
  messageDefault: string;
}>;

/**
 * AccessDenied Component
 * 
 * Renders access denied UI with context-aware messaging and actions
 */
async function AccessDenied({ 
  component,
  context,
}: AccessDeniedProps) {
  // Get authentication state
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  
  // Get reason from URL (passed via query params)
  const searchParams = (context as CompositionContext)?.searchParams || {};
  const reason = (typeof searchParams?.reason === 'string' ? searchParams.reason : undefined);
  const fromUrl = (typeof searchParams?.from === 'string' ? searchParams.from : undefined);
  const locale = (typeof searchParams?.locale === 'string' ? searchParams.locale : undefined) || 'en';
  
  return (
    <div className="relative container mx-auto px-4 py-20 my-12 text-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      {/* Icon and Header */}
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-8 ring-destructive/5">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>

        {/* Title and Description */}
        <div className="space-y-4">
          <UniformText
            placeholder="Access Denied"
            parameterId="title"
            component={component}
            context={context}
            as="h1"
            className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent"
          />
          <UniformText
            placeholder="You don't have the necessary permissions to view this page"
            parameterId="description"
            component={component}
            context={context}
            as="p"
            className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto"
          />
        </div>

        {/* Reason-specific messaging */}
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 max-w-xl mx-auto">
          {reason === 'anonymous' && isAuthenticated && (
            <UniformText
              placeholder="This content is only available to visitors who are not logged in. Please sign out to view this page."
              parameterId="messageAnonymous"
              component={component}
              context={context}
              as="p"
              className="text-gray-700 leading-relaxed"
            />
          )}
          {reason === 'users' && !isAuthenticated && (
            <UniformText
              placeholder="This content is only available to authenticated users. Please sign in to continue."
              parameterId="messageUsers"
              component={component}
              context={context}
              as="p"
              className="text-gray-700 leading-relaxed"
            />
          )}
          {!reason && (
            <UniformText
              placeholder="This content has restricted access. Please check your permissions or contact support if you believe this is an error."
              parameterId="messageDefault"
              component={component}
              context={context}
              as="p"
              className="text-gray-700 leading-relaxed"
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-4">
          {/* Show Sign In button if not authenticated */}
          {!isAuthenticated && (
            <Button asChild className="flex-1" size="lg">
              <Link href={`/login?callbackUrl=${encodeURIComponent(fromUrl || `/${locale}`)}`}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
          
          {/* Show Sign Out button if logged in trying to access anonymous-only content */}
          {isAuthenticated && reason === 'anonymous' && (
            <div className="flex-1">
              <SignOutButton 
                variant="default" 
                size="lg"
                className="w-full"
              />
            </div>
          )}
          
          {/* Always show Go Home button */}
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href={`/${locale}`}>
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </div>

        {/* Additional help text */}
        <div className="text-sm text-gray-500 pt-6">
          {reason === 'anonymous' && isAuthenticated ? (
            <p>Sign out to view this content as a visitor.</p>
          ) : (
            <p>
              If you believe this is an error, please contact support or try signing in with a different account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component mapping for Uniform Canvas
 * Registers this component so it can be used in Canvas
 */
export const accessDeniedMapping = {
  type: "accessDenied",
  component: AccessDenied,
};