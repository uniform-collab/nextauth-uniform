/**
 * PREVIEW API ROUTE - Uniform Canvas Integration Endpoint
 * 
 * This API route handles preview/editing requests from Uniform Canvas.
 * When a content author opens a page in Uniform Canvas, it sends requests here
 * to enable draft mode and allow live editing.
 * 
 * Flow:
 * 1. Uniform Canvas sends preview request with secret token
 * 2. This endpoint validates the secret
 * 3. Enables Next.js Draft Mode (allows viewing unpublished content)
 * 4. Returns success, allowing Canvas to load the page in edit mode
 */

import {
    createPreviewGETRouteHandler,
    createPreviewPOSTRouteHandler,
    createPreviewOPTIONSRouteHandler,
  } from '@uniformdev/canvas-next-rsc/handler';
import { NextRequest } from 'next/server';

/**
 * GET handler - Main preview endpoint
 * Validates request and enables draft mode for Uniform Canvas editing
 * 
 * Configuration:
 * - playgroundPath: Fallback route for Canvas playground mode
 * 
 * The secret token is validated against UNIFORM_PREVIEW_SECRET in .env
 */
const getHandler = createPreviewGETRouteHandler({
  playgroundPath: '/playground',
});

/**
 * POST handler - Handles Canvas state updates
 * Used when Canvas needs to update composition state
 */
const postHandler = createPreviewPOSTRouteHandler();

/**
 * OPTIONS handler - CORS preflight
 * Allows Canvas (running in different domain) to communicate with your app
 */
const optionsHandler = createPreviewOPTIONSRouteHandler();

/**
 * HTTP GET method handler
 * Processes preview requests from Uniform Canvas
 */
export async function GET(request: NextRequest) {
  const response = await getHandler(request);
  return response;
}

/**
 * HTTP POST method handler
 * Updates composition state from Uniform Canvas
 */
export async function POST(request: NextRequest) {
  return postHandler(request);
}

/**
 * HTTP OPTIONS method handler
 * Handles CORS preflight requests
 */
export async function OPTIONS() {
  return optionsHandler();
}
  