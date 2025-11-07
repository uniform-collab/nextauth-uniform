/**
 * LOCALE HELPER - Internationalization (i18n) for Uniform Routes
 * 
 * This helper bridges Next.js locale routing with Uniform's project map structure.
 * 
 * PROBLEM IT SOLVES:
 * Next.js routes: /en/about, /fr/about
 * Uniform project map: Expects paths with locale: /:locale/about
 * This helper ensures paths sent to Uniform always include the locale segment
 */

import { retrieveRoute as uniformRetrieveRoute } from '@uniformdev/canvas-next-rsc';
import i18n from './locales.json';

// Supported locales from configuration file
const locales = i18n.locales as string[];

/**
 * Checks if a path already contains a locale segment
 * 
 * @param path - URL path (string or array of segments)
 * @returns true if locale is already present
 * 
 * Examples:
 * isLocaleInPath(['en', 'about']) → true
 * isLocaleInPath(['about', 'team']) → false
 */
function isLocaleInPath(path: string | string[]): boolean {
  const segments = Array.isArray(path) ? path : [path];
  return segments.some(segment => locales.includes(segment));
}

/**
 * Formats path to include locale if missing
 * 
 * @param path - Original path from Next.js routing
 * @param locale - Current locale (or null to use default)
 * @returns Path with locale prepended
 * 
 * TRANSFORMATION EXAMPLES:
 * 
 * Input: path=undefined, locale='en'
 * Output: 'en'
 * Final URL: /en
 * 
 * Input: path=['about'], locale='en'
 * Output: ['en', 'about']
 * Final URL: /en/about
 * 
 * Input: path=['en', 'about'], locale='en'
 * Output: ['en', 'about'] (no change - already has locale)
 * 
 * Input: path='products/shoes', locale='fr'
 * Output: 'fr/products/shoes'
 * Final URL: /fr/products/shoes
 */
function formatPath(path?: string | string[], locale?: string | null): string | string[] | undefined {
  // Use provided locale or fall back to default
  let localeForPath = locale || i18n.defaultLocale;

  // For root pages: return just the locale
  // Uniform will prepend the slash automatically
  if (!path) return localeForPath;

  // If path already includes locale, don't add it again
  if (isLocaleInPath(path)) return path;

  // Add locale to path:
  // Arrays: prepend locale to beginning
  // Strings: concatenate with slash separator
  return Array.isArray(path) 
    ? [localeForPath, ...path] 
    : `${localeForPath}/${path}`;
}

/**
 * Retrieves route from Uniform with locale handling
 * 
 * This is a wrapper around Uniform's retrieveRoute that:
 * 1. Takes Next.js routing parameters
 * 2. Ensures locale is included in the path
 * 3. Queries Uniform's API for the composition
 * 4. Returns the page structure
 * 
 * @param props - PageParameters from Next.js (params, searchParams)
 * @param locale - Current locale code
 * @returns Uniform composition data
 */
const retrieveRoute = async (
  props: Parameters<typeof uniformRetrieveRoute>[0], 
  locale?: string | null
) => {
  const params = await props.params;
  const updatedParams = await getUpdatedParams(params, locale);
  
  // Query Uniform with locale-formatted path
  return uniformRetrieveRoute({
    ...props,
    params: Promise.resolve(updatedParams),
  });
};

/**
 * Updates parameters with formatted path
 * 
 * @param params - Original Next.js route parameters
 * @param locale - Current locale
 * @returns Updated parameters with locale in path
 */
async function getUpdatedParams(
  params: { path?: string | string[] } | undefined, 
  locale: string | null | undefined
) {
  return Promise.resolve({
    ...params,
    path: formatPath(params?.path, locale),
  });
}

// Export the enhanced route retrieval function
export default retrieveRoute;
