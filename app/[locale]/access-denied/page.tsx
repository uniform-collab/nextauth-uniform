/**
 * ACCESS DENIED PAGE
 * 
 * Shown when users try to access content they don't have permission for.
 * 
 * This page renders content from Uniform Canvas, allowing editors to
 * customize the access denied experience through the CMS.
 * 
 * Scenarios handled:
 * 1. Not logged in trying to access authenticated content
 * 2. Logged in trying to access anonymous-only content
 * 3. Future: Wrong role/permissions
 */

import {
  UniformComposition,
  createServerUniformContext,
} from "@uniformdev/canvas-next-rsc";
import { resolveComponent } from "@/uniform/resolve";
import retrieveRoute from "@/uniform/l18n/localeHelper";
import type { LocalePageParameters } from "@/types/uniform";

/**
 * Force dynamic rendering
 * This page needs to check authentication status on every request
 */
export const dynamic = 'force-dynamic';

/**
 * Access Denied Page Component
 * 
 * Renders content from Uniform Canvas
 * The AccessDenied component handles all the UI and logic
 */
export default async function AccessDeniedPage(props: LocalePageParameters) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Get locale for proper URL generation
  const locale = params.locale || 'en';
  
  // Fetch Uniform composition for this page
  const modifiedProps = {
    ...props,
    params: Promise.resolve({
      ...(params || {}),
      path: ['access-denied']
    }),
  };
  
  const route = await retrieveRoute(modifiedProps, locale);
  const serverContext = await createServerUniformContext({
    searchParams,
  });
  
  return (
    <UniformComposition
      {...modifiedProps}
      route={route}
      resolveComponent={resolveComponent}
      serverContext={serverContext}
      mode="server"
    />
  );
}

