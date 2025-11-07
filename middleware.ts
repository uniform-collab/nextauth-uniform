/**
 * MIDDLEWARE - Global Request Interceptor
 * 
 * This runs on EVERY request before it reaches your pages.
 * 
 * This middleware handles two primary concerns:
 * 1. Internationalization (i18n): Ensures all URLs have a locale prefix (e.g., /en, /fr)
 * 2. Authentication: Protects specific routes requiring user login
 * 
 * Execution Order:
 * Request → Middleware → Page Component → Response
 */

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Supported locales
const locales = ['en', 'fr'];
const defaultLocale = 'en';

// Routes that don't require locale prefix
const NON_LOCALIZED_ROUTES = [
  '/api',
  '/_next',
  '/login',
  '/playground',
];

/**
 * Check if a path should skip locale handling
 */
function shouldSkipLocale(pathname: string): boolean {
  return NON_LOCALIZED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Main middleware handler
 * Processes requests to add locale prefixes where missing
 * 
 * @param req - The incoming HTTP request
 * @returns NextResponse - Either a redirect or allows request to continue
 */
function middlewareHandler(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check if the current path already has a locale
  // e.g., /en/page is valid, /page needs redirection to /en/page
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect root path to default locale
  // Example: / → /en
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, req.url));
  }

  // Redirect paths without locale to include the default locale
  // Skip non-localized routes
  // Example: /about → /en/about
  if (pathnameIsMissingLocale && !shouldSkipLocale(pathname)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Wrap middleware with authentication
 * The withAuth wrapper adds authentication checking capabilities
 */
export default withAuth(middlewareHandler, {
    pages: {
    // Where to redirect if authentication is required but user is not logged in
      signIn: "/login",
    },
  callbacks: {
    /**
     * Authorization callback - decides if user can access a route
     * 
     * @param req - Request object
     * @param token - User's auth token (null if not authenticated)
     * @returns boolean - true allows access, false redirects to login
     */
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;
      const searchParams = req.nextUrl.searchParams;
      
      /**
       * CANVAS EDITOR BYPASS
       * Allow Uniform Canvas to access protected routes for editing/preview
       * without authentication. This is necessary for content authors to edit
       * protected content in the Canvas editor.
       * 
       * SECURITY CHECKS (any of these conditions grants access):
       * 
       * 1. Draft Mode Cookie: Set by /api/preview route when Canvas initializes
       *    This is the most secure method as cookies are HTTP-only
       * 
       * 2. Canvas + Secret: Both is_incontext_editing_mode=true AND valid secret
       *    Used when initially loading Canvas or navigating with query params
       * 
       * Why multiple checks?
       * - When navigating between pages in Canvas, query params might not persist
       * - Draft mode cookie persists across navigation
       * - This ensures smooth editing experience without security compromise
       */
      const isCanvasEditing = searchParams.get('is_incontext_editing_mode') === 'true';
      const hasPreviewSecret = searchParams.get('secret') === process.env.UNIFORM_PREVIEW_SECRET;
      
      // Check for Next.js draft mode cookie (set by /api/preview)
      const draftModeCookie = req.cookies.get('__prerender_bypass');
      const hasDraftMode = !!draftModeCookie;
      
      // Allow access if:
      // 1. Draft mode is enabled (most secure - set by preview API)
      // 2. OR both Canvas editing flag AND valid secret are present
      if (hasDraftMode || (isCanvasEditing && hasPreviewSecret)) {
        // Allow Canvas editor to access all routes
        return true;
      }
      
      /**
       * ROUTE-LEVEL PROTECTION
       * 
       * Routes containing '/cms-protected' ALWAYS require authentication.
       * This is enforced at the middleware level (before page code runs).
       * 
       * Note: This takes precedence over composition-level access control.
       * Even if a page has accessType: 'everyone' in Uniform, 
       * the route-level protection is still enforced.
       * 
       * For flexible page-level protection without route constraints,
       * use composition-level accessType parameter on /cms/* routes.
       */
      if (pathname.includes('/cms-protected')) {
        return !!token;
      }
      
      /**
       * PUBLIC ROUTES
       * 
       * All other routes are public by default at the middleware level.
       * However, individual pages on /cms/* routes can still enforce
       * authentication using composition-level accessType parameters.
       */
      return true;
    },
  },
});

/**
 * Matcher configuration - defines which routes this middleware applies to
 * 
 * This pattern matches all routes EXCEPT:
 * - Next.js internal routes (_next/)
 * - API authentication routes (api/auth/)
 * - Static files (favicon.ico, images, etc.)
 */
export const config = {
  matcher: [
    '/((?!_next|api/auth|favicon.ico|.*\\..*).*)',
  ],
}
