/**
 * UNIFORM TYPES - Custom TypeScript Definitions
 * 
 * Import official Uniform types directly from their packages:
 * - @uniformdev/canvas
 * - @uniformdev/canvas-next-rsc/component
 */

import type { PageParameters as UniformPageParameters } from "@uniformdev/canvas-next-rsc";

/**
 * Page Parameters with Locale Support
 * 
 * Extends Uniform's PageParameters to include locale in the params.
 * This maintains full compatibility with Uniform while adding type safety for locale.
 * 
 * @example
 * ```typescript
 * export default async function MyPage(props: LocalePageParameters) {
 *   const params = await props.params; // Has locale and path properties
 *   const searchParams = await props.searchParams;
 *   const locale = params.locale || 'en'; // No casting needed!
 * }
 * ```
 */
export type LocalePageParameters = Omit<UniformPageParameters, 'params'> & {
  params: Promise<{
    locale?: string;
    path?: string | string[];
    [key: string]: string | string[] | undefined;
  }>;
};

/**
 * Extended Server Context
 * 
 * The return type of createServerUniformContext with additional runtime properties.
 */
export type UniformServerContextExtended = Awaited<ReturnType<typeof import("@uniformdev/canvas-next-rsc").createServerUniformContext>> & {
  previewMode?: 'editor' | 'preview';
};

/**
 * Context type for the access control enhancer
 * Pass authentication state through the enhancer context
 */
export interface AccessControlEnhancerContext {
  preview?: boolean;
  isCanvasMode?: boolean;
  session?: { user?: unknown } | null;
  [key: string]: unknown;
}
