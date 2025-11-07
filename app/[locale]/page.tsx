/**
 * LOCALE ROOT PAGE HANDLER
 *
 * This is a dynamic route handler that processes all locale-prefixed root pages.
 * Route pattern: /[locale] (e.g., /en, /fr, /nl)
 *
 * KEY CONCEPTS:
 *
 * 1. FILE-BASED ROUTING:
 *    Next.js uses the file system structure for routing.
 *    - Brackets [locale] = dynamic segment (like a route parameter)
 *    - This file handles: /en, /fr, /nl, etc.
 *
 * 2. SERVER COMPONENTS (RSC):
 *    This is a React Server Component - it runs ONLY on the server, never in browser
 *    - Can directly access databases, filesystems, APIs
 *    - No client-side JavaScript bundle
 *    - Much faster than traditional React components
 *
 * 3. UNIFORM INTEGRATION:
 *    Uniform Canvas provides the content management layer
 *    This component fetches and renders content from Uniform
 */

import {
  UniformComposition,
  createServerUniformContext,
} from "@uniformdev/canvas-next-rsc";
import { enhance } from "@uniformdev/canvas";
import { resolveComponent } from "@/uniform/resolve";
import retrieveRoute from "@/uniform/l18n/localeHelper";
import { draftMode } from "next/headers";
import { notFound, redirect as nextRedirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  createAccessControlEnhancer,
  filterUnauthorizedComponents,
} from "@/uniform/enhancers";
import type { LocalePageParameters } from "@/types/uniform";

/**
 * Main page handler - runs on every request to /{locale}
 *
 * @param props - Contains route parameters and search parameters
 * @returns JSX - Rendered page content from Uniform Canvas
 *
 * ASYNC COMPONENT NOTE:
 * Unlike traditional React, Next.js Server Components can be async functions.
 * This allows direct data fetching without useState/useEffect hooks.
 */
export default async function HomePage(props: LocalePageParameters) {
  // Extract parameters from the request
  // In Next.js 15+, params and searchParams are Promises that must be awaited
  const params = await props.params;
  const searchParams = await props.searchParams;
  const locale = params.locale || "en";

  /**
   * DRAFT MODE CHECK (Uniform Canvas / Preview Mode)
   *
   * Draft Mode is Next.js's built-in preview mechanism
   *
   * When enabled (by the preview API route):
   * - Allows viewing unpublished content
   * - Bypasses caching for live editing
   * - Cannot be faked via URL parameters (server-side cookie validation)
   *
   * Security: Only enabled when valid preview secret is provided
   */
  const { isEnabled: isDraftMode } = await draftMode();

  /**
   * ROUTE RETRIEVAL
   *
   * Fetches the page composition from Uniform Canvas
   * The retrieveRoute helper:
   * - Queries Uniform's API for the page content
   * - Handles locale-specific content routing
   * - Returns composition structure (components, parameters, etc.)
   */
  const route = await retrieveRoute(props, locale);

  /**
   * UNIFORM CONTEXT CREATION
   *
   * Creates server-side context for Uniform features:
   * - Personalization: Target content based on visitor data
   * - A/B Testing: Serve variants for optimization
   * - Analytics: Track component interactions
   */
  const serverContext = await createServerUniformContext({
    searchParams,
  });

  /**
   * ACCESS CONTROL ENHANCEMENT
   *
   * Use Uniform enhancers to filter components based on authentication.
   * Components with accessType parameter are evaluated and unauthorized
   * components are removed from the composition before rendering.
   *
   * This happens server-side and is bypassed in Canvas mode.
   */
  const session = await getServerSession(authOptions);
  const isCanvasMode =
    isDraftMode || searchParams?.is_incontext_editing_mode === "true";

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
      nextRedirect(redirectTarget);
    }
    return notFound();
  }

  if (route.type !== "composition") {
    // Handle not found or any other unknown route types
    return notFound();
  }

  // Get the composition for enhancement
  const composition = route.compositionApiResponse?.composition;

  if (composition) {
    // Step 1: Run enhancer to add data properties to all components
    // Adds _authState and _accessControl to component.data
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
   * RENDER UNIFORM COMPOSITION
   *
   * UniformComposition is the main rendering component that:
   * 1. Takes the route/composition data from Uniform
   * 2. Resolves each component type to its React component (using resolveComponent)
   * 3. Renders the full component tree
   * 4. In Canvas mode: adds editing UI overlays
   *
   * Props:
   * - route: The page composition structure from Uniform
   * - resolveComponent: Maps component types to React components
   * - serverContext: Personalization/tracking context
   * - mode="server": Indicates this is server-side rendering (SSR)
   */
  return (
    <UniformComposition
      {...props}
      route={route}
      resolveComponent={resolveComponent}
      serverContext={serverContext}
      mode="server"
    />
  );
}
