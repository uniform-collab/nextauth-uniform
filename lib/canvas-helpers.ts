/**
 * CANVAS HELPERS - Shared utilities for Canvas mode detection
 * 
 * These utilities help components detect Canvas editing mode and
 * determine when to show mock user interfaces for protected content.
 */

import { draftMode } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * Mock user data for Canvas preview
 * Used when editors need to see how protected content appears to authenticated users
 */
export const MOCK_USER = {
  name: "Jane Editor",
  email: "editor@example.com",
  provider: "Canvas Preview" as const,
  image: undefined,
  accountId: "mock-12345",
} as const;

/**
 * Determines if we're in Canvas editor/preview mode
 * 
 * @param context - Uniform composition context
 * @returns Object with Canvas mode information
 */
export async function getCanvasMode(context?: {
  isContextualEditing?: boolean;
  isDraftMode?: boolean;
  previewMode?: 'editor' | 'preview' | undefined;
  path?: string;
}) {
  const { isContextualEditing, isDraftMode, previewMode, path } = context || {};
  const { isEnabled: serverDraftMode } = await draftMode();
  
  const isCanvasMode = isContextualEditing && (isDraftMode || serverDraftMode);
  const isOnProtectedRoute = path?.includes('cms-protected') || false;
  
  return {
    isCanvasMode,
    isOnProtectedRoute,
    previewMode,
  };
}

/**
 * Gets the appropriate user to display (real session or mock for Canvas)
 * 
 * @param context - Uniform composition context
 * @returns Object with user display information
 */
export async function getDisplayUser(context?: {
  isContextualEditing?: boolean;
  isDraftMode?: boolean;
  previewMode?: 'editor' | 'preview' | undefined;
  path?: string;
}) {
  const session = await getServerSession(authOptions);
  const canvasInfo = await getCanvasMode(context);
  
  // Only show mock user when:
  // 1. In Canvas mode
  // 2. On a protected route
  // 3. No real session exists
  const shouldShowMockUser = 
    canvasInfo.isCanvasMode && 
    canvasInfo.isOnProtectedRoute && 
    !session?.user;
  
  const displayUser = session?.user || (shouldShowMockUser ? MOCK_USER : null);
  
  return {
    displayUser,
    isShowingMockUser: shouldShowMockUser,
    realSession: session,
    ...canvasInfo,
  };
}

