/**
 * PROTECTED CMS PAGES - Authentication Required Content
 *
 * This route handler manages CMS pages that require user authentication.
 * It demonstrates key concepts for protected, content-managed pages.
 *
 * KEY FEATURES:
 * 1. Authentication Enforcement: Redirects unauthenticated users to login
 * 2. Canvas Editor Support: Allows editing in Uniform Canvas without login
 * 3. Mock User Interface: Shows preview of authenticated state in Canvas
 * 4. Server-Side Session Checks: Secure, cannot be bypassed by client
 *
 * ACCESS CONTROL HIERARCHY:
 * 
 * Route-Level (This File):
 * - /cms-protected/* ALWAYS requires authentication in production
 * - This takes precedence over any Uniform composition settings
 * - Even if a composition has accessType: 'everyone', auth is still required
 * 
 * Composition-Level (Uniform Parameter):
 * - Works on /cms/* routes (non-protected)
 * - Allows individual pages to require auth without changing routes
 * - Ignored on /cms-protected/* routes (route-level wins)
 * 
 * HOW IT WORKS:
 * - Production: Requires valid NextAuth.js session to view
 * - Canvas Mode: Bypasses auth, shows mock user interface for preview
 * - Middleware: Coordinates with middleware.ts for Canvas access
 */

import { redirect, notFound } from "next/navigation";
import { draftMode } from "next/headers";
import {
  PageParameters,
  UniformComposition,
  createServerUniformContext,
} from "@uniformdev/canvas-next-rsc";
import { enhance } from "@uniformdev/canvas";
import { resolveComponent } from "@/uniform/resolve";
import retrieveRoute from "@/uniform/l18n/localeHelper";
import { getDisplayUser } from "@/lib/canvas-helpers";
import { UserInfoBadge } from "@/components/auth/user-info-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { createAccessControlEnhancer, filterUnauthorizedComponents } from "@/uniform/enhancers";
import type { UniformServerContextExtended } from "@/types/uniform";

// Force dynamic rendering for CMS pages to ensure fresh content
export const dynamic = 'force-dynamic';

export default async function ProtectedCMSPage(props: PageParameters) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // Get locale from searchParams or use default
  // searchParams values can be string | string[] | undefined, we want only string
  const localeParam = searchParams?.locale;
  const locale = (typeof localeParam === 'string' ? localeParam : undefined) || 'en';
  
  // Prepend /cms-protected to the path for Uniform
  const modifiedProps = {
    ...props,
    params: Promise.resolve({
      ...(params || {}),
      path: params?.path ? ['cms-protected', ...(Array.isArray(params.path) ? params.path : [params.path])] : ['cms-protected']
    }),
  };

  const route = await retrieveRoute(modifiedProps, locale);
  
  /**
   * CREATE SERVER CONTEXT FIRST
   * We need this to access the previewMode property from Uniform
   */
  const serverContext = await createServerUniformContext({
    searchParams,
  }) as UniformServerContextExtended;
  
  /**
   * USE SHARED CANVAS HELPERS
   * Get user display state and Canvas mode information from centralized utility
   * 
   * Pass minimal context - the helper will detect we're on a protected route
   * based on the path including 'cms-protected'
   */
  const { isEnabled: isDraftMode } = await draftMode();
  const routeContext = {
    isContextualEditing: searchParams?.is_incontext_editing_mode === 'true',
    isDraftMode,
    path: '/cms-protected', // We know we're on a protected route
  };
  
  const { displayUser, isShowingMockUser, isCanvasMode, realSession } = await getDisplayUser(routeContext);

  /**
   * ROUTE TYPE HANDLING
   * 
   * Uniform can return different route types:
   * - 'composition': Normal page with content to render
   * - 'redirect': Route should redirect to another URL
   * - 'notFound': Route doesn't exist (404)
   */
  if (route.type === "redirect") {
    // Handle redirect responses from Uniform
    const redirectTarget = route.redirect?.targetUrl;
    if (redirectTarget) {
      redirect(redirectTarget);
    }
    return notFound();
  }

  if (route.type !== "composition") {
    // Handle not found or any other unknown route types
    return notFound();
  }
  
  // After type guard, TypeScript knows route is RouteGetResponseComposition

  // Redirect to login if not authenticated and not in Canvas mode
  if (!realSession?.user && !isCanvasMode) {
    redirect("/login");
  }
  
  /**
   * DETERMINE CANVAS MODE FROM UNIFORM CONTEXT
   * Use the previewMode property from serverContext to accurately determine
   * whether we're in editor or preview mode
   */
  const uniformPreviewMode = serverContext?.previewMode;

  /**
   * COMPONENT-LEVEL ACCESS CONTROL (Enhancer)
   * 
   * Use Uniform enhancers to add authentication state and filter components.
   * Even on protected routes, individual components might have different access rules.
   * 
   * The enhancer:
   * 1. Adds _authState to all components (avoids duplicate getServerSession calls)
   * 2. Adds _accessControl metadata for access decisions
   * 3. Filters unauthorized components (unless in Canvas mode)
   * 
   * This happens server-side before rendering, so unauthorized components
   * never reach the client.
   */
  const composition = route.compositionApiResponse?.composition;
  
  if (composition) {
    // Step 1: Run enhancer to add data properties to all components
    await enhance({
      composition: composition,
      enhancers: createAccessControlEnhancer(),
      context: {
        preview: isDraftMode,
        isCanvasMode,
        session: realSession,
      },
    });
    
    // Step 2: Remove unauthorized components (skipped in Canvas mode)
    if (!isCanvasMode) {
      filterUnauthorizedComponents(composition);
    }
  }

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
            🔒 Protected Route
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isShowingMockUser 
              ? `You're ${uniformPreviewMode === 'editor' ? 'editing' : 'previewing'} a protected route in Canvas. In production, this page requires authentication - only logged-in users can access it.`
              : "Content managed through Uniform Canvas. This route requires authentication to access."
            }
          </p>
        </div>
      </div>

      {displayUser && (
        <div className="container mx-auto px-4 mb-8">
          <div className="relative">
            {isShowingMockUser && (
              <div className="absolute -top-3 -right-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                  👤 Preview User
                </span>
              </div>
            )}
            <div className={
              isShowingMockUser 
                ? "border-2 border-dashed border-purple-300 rounded-xl p-6 bg-gradient-to-br from-purple-50/50 to-white shadow-sm" 
                : "border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            }>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                User Information
              </h3>
              <UserInfoBadge
                name={displayUser.name || "User"}
                email={displayUser.email || undefined}
                provider={displayUser.provider}
                image={displayUser.image || undefined}
                accountId={displayUser.accountId}
              />
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isShowingMockUser ? (
                  <button
                    disabled
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed flex items-center gap-2"
                    title="This is a mock button for Canvas preview"
                  >
                    <span>🔒</span>
                    <span>Sign Out (Preview Only)</span>
                  </button>
                ) : (
                  <SignOutButton variant="outline" className="w-auto" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <UniformComposition
        {...modifiedProps}
        route={route}
        resolveComponent={resolveComponent}
        serverContext={serverContext}
        mode="server"
      />
    </>
  );
}

