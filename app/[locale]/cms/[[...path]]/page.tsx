/**
 * CMS CATCH-ALL PAGE HANDLER
 * 
 * Dynamic route that handles all pages under /[locale]/cms/*
 * Route pattern: /[locale]/cms/[[...path]]
 * 
 * ROUTE PATTERN EXPLANATION:
 * - [locale]: Dynamic segment for language (en, fr, nl)
 * - [[...path]]: Optional catch-all for any depth of URLs
 *   - Single brackets [...path] = required (must have at least one segment)
 *   - Double brackets [[...path]] = optional (can be empty)
 * 
 * Examples:
 * - /en/cms → matches (path is undefined)
 * - /en/cms/about → matches (path = ['about'])
 * - /en/cms/products/shoes → matches (path = ['products', 'shoes'])
 */

import {
  PageParameters,
  UniformComposition,
  createServerUniformContext,
} from "@uniformdev/canvas-next-rsc";
import { enhance } from "@uniformdev/canvas";
import { resolveComponent } from "@/uniform/resolve";
import retrieveRoute from "@/uniform/l18n/localeHelper";
import { draftMode } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createAccessControlEnhancer, filterUnauthorizedComponents } from "@/uniform/enhancers";
import type { UniformServerContextExtended } from "@/types/uniform";

/**
 * Force dynamic rendering
 * Prevents Next.js from statically generating these pages at build time
 * 
 * Why: CMS pages are personalized and may change frequently
 */
export const dynamic = 'force-dynamic';

/**
 * CMS Page Handler
 * Renders content-managed pages with layout wrapper
 */
export default async function CMSPage(props: PageParameters) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Get locale (for multi-language support)
  // searchParams values can be string | string[] | undefined, we want only string
  const localeParam = searchParams?.locale;
  const locale = (typeof localeParam === 'string' ? localeParam : undefined) || 'en';
  
  /**
   * PATH TRANSFORMATION for Uniform
   * 
   * URL: /en/cms/about/team
   * Next.js params: { locale: 'en', path: ['about', 'team'] }
   * Uniform needs: { path: ['cms', 'about', 'team'] }
   * 
   * We prepend 'cms' to match the Uniform project map structure
   */
  const modifiedProps = {
    ...props,
    params: Promise.resolve({
      ...(params || {}),
      path: params?.path 
        ? ['cms', ...(Array.isArray(params.path) ? params.path : [params.path])]
        : ['cms']
    }),
  };
  
  // Fetch composition from Uniform
  const route = await retrieveRoute(modifiedProps, locale);
  
  /**
   * CREATE SERVER CONTEXT FIRST
   * We need this to access the previewMode property from Uniform
   */
  const serverContext = await createServerUniformContext({
    searchParams,
  }) as UniformServerContextExtended;
  
  /**
   * CANVAS MODE DETECTION
   * Check if we're in Uniform Canvas editor or preview mode
   * Use the previewMode from Uniform context for accurate detection
   */
  const { isEnabled: isDraftMode } = await draftMode();
  const isIncontextEditing = searchParams?.is_incontext_editing_mode === 'true';
  const isCanvasMode = isDraftMode || isIncontextEditing;
  
  // Determine specific Canvas mode from Uniform's previewMode property
  const uniformPreviewMode = serverContext?.previewMode;
  
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
  
  /**
   * COMPOSITION-LEVEL ACCESS CONTROL
   * 
   * Check the composition's 'accessType' parameter and enforce access control.
   * This allows pages to require authentication even if not in a protected route.
   * 
   * Access Control Rules:
   * - 'everyone': Public access (default)
   * - 'users': Requires authentication
   * - 'anonymous': Only for logged-out users
   * 
   * Note: In Canvas mode, bypass access control to allow editing
   */
  // Get user session EARLY (before checking composition)
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  
  if (!isCanvasMode) {
    // Get the composition's access parameter
    const composition = route.compositionApiResponse?.composition;
    const accessType = (typeof composition?.parameters?.accessType?.value === 'string' 
      ? composition.parameters.accessType.value 
      : 'everyone');
    
    // Enforce access control based on accessType
    // These redirects happen BEFORE rendering anything
    if (accessType === 'users' && !isAuthenticated) {
      // Page requires authentication - redirect to access-denied
      const currentPath = `/${locale}/cms${params?.path ? '/' + (Array.isArray(params.path) ? params.path.join('/') : params.path) : ''}`;
      redirect(`/${locale}/access-denied?reason=users&from=${encodeURIComponent(currentPath)}`);
    } else if (accessType === 'anonymous' && isAuthenticated) {
      // Page is only for anonymous users - redirect to access-denied
      const currentPath = `/${locale}/cms${params?.path ? '/' + (Array.isArray(params.path) ? params.path.join('/') : params.path) : ''}`;
      redirect(`/${locale}/access-denied?reason=anonymous&from=${encodeURIComponent(currentPath)}`);
    }
  }
  
  /**
   * COMPONENT-LEVEL ACCESS CONTROL (Enhancer)
   * 
   * Use Uniform enhancers to add authentication state and filter components.
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
        session,
      },
    });
    
    // Step 2: Remove unauthorized components (skipped in Canvas mode)
    if (!isCanvasMode) {
      filterUnauthorizedComponents(composition);
    }
  }
  
  /**
   * RENDER PAGE
   * 
   * Structure:
   * - Custom Header: Shows Canvas mode or standard CMS header
   * - UniformComposition: Dynamic content from Uniform Canvas
   */
  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {isCanvasMode ? '🌐 Public Route' : '📄 CMS Powered Page'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isCanvasMode 
              ? `You're ${uniformPreviewMode === 'editor' ? 'editing' : 'previewing'} a public route in Canvas. This page is accessible to all visitors - no authentication required. ${uniformPreviewMode === 'editor' ? 'Make changes to content and see them update in real-time.' : ''}`
              : 'Content managed through Uniform Canvas. This route is publicly accessible without authentication.'
            }
          </p>
        </div>
      </div>

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
