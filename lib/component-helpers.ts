/**
 * COMPONENT HELPERS - Reusable Component Utilities
 * 
 * Common logic extracted from Uniform components to avoid duplication.
 * These utilities help with Canvas mode detection, access control, and more.
 * 
 * WHY THIS EXISTS:
 * Without these helpers, every component would need to duplicate:
 * - Canvas mode detection logic
 * - Access type extraction and validation
 * - Access info mapping (icons, labels, colors)
 * - Authentication state retrieval
 * 
 * By centralizing this logic, we ensure:
 * - Consistency across all components
 * - Single source of truth
 * - Easier testing and maintenance
 * - Reduced code duplication
 */

import { draftMode } from "next/headers";
import type { CompositionContext } from "@uniformdev/canvas-next-rsc/component";
import type { EnhancedComponentProps } from "@/uniform/enhancers";
import { Lock, Users, Globe, type LucideIcon } from "lucide-react";

/**
 * Canvas mode information
 */
export interface CanvasMode {
  isSecureCanvasMode: boolean;
  previewMode?: 'editor' | 'preview';
  canvasMode: string;
  modeIcon: string;
  modeColor: string;
}

/**
 * Access type information
 */
export interface AccessInfo {
  icon: LucideIcon;
  label: string;
  color: string;
}

/**
 * Detect Canvas mode with security verification
 * 
 * Combines Uniform's context flags with Next.js Draft Mode
 * for secure Canvas editor detection.
 * 
 * @param context - Uniform composition context
 * @returns Canvas mode information
 * 
 * @example
 * ```typescript
 * const canvasMode = await detectCanvasMode(context);
 * if (canvasMode.isSecureCanvasMode) {
 *   // Render Canvas editor UI
 * }
 * ```
 */
export async function detectCanvasMode(context: CompositionContext): Promise<CanvasMode> {
  const { previewMode, isContextualEditing, isDraftMode } = context;
  
  // SECURITY: Dual verification for Canvas mode
  // Draft Mode uses secure HTTP-only cookies set by preview API
  const { isEnabled: serverDraftMode } = await draftMode();
  const isSecureCanvasMode = isContextualEditing && (isDraftMode || serverDraftMode);
  
  // Determine the specific Canvas mode from Uniform's previewMode
  const canvasMode = previewMode === 'editor' ? 'Edit Mode' : 'Preview Mode';
  const modeIcon = previewMode === 'editor' ? '✏️' : '👁️';
  const modeColor = previewMode === 'editor'
    ? 'from-blue-500 to-indigo-600' 
    : 'from-purple-500 to-purple-700';
  
  return {
    isSecureCanvasMode,
    previewMode,
    canvasMode,
    modeIcon,
    modeColor,
  };
}

/**
 * Get access type from component parameters
 * 
 * Extracts and validates the accessType parameter from a component.
 * 
 * @param component - Uniform component instance
 * @returns Access type ('everyone', 'users', or 'anonymous')
 * 
 * @example
 * ```typescript
 * const accessType = getAccessType(component);
 * // Returns: 'everyone' | 'users' | 'anonymous'
 * ```
 */
export function getAccessType(component: EnhancedComponentProps<any>['component']): 'anonymous' | 'users' | 'everyone' {
  const accessTypeValue = component.parameters?.accessType?.value;
  return (typeof accessTypeValue === 'string' ? accessTypeValue : 'everyone') as 'anonymous' | 'users' | 'everyone';
}

/**
 * Get access info (icon, label, color) for an access type
 * 
 * Returns UI-ready information for displaying access control badges.
 * 
 * @param accessType - The access type
 * @returns Access information with icon, label, and color classes
 * 
 * @example
 * ```typescript
 * const info = getAccessInfo('users');
 * const Icon = info.icon;
 * return <Icon className={info.color} />;
 * ```
 */
export function getAccessInfo(accessType: 'anonymous' | 'users' | 'everyone'): AccessInfo {
  switch (accessType) {
    case 'anonymous':
      return { 
        icon: Globe, 
        label: 'Anonymous Only', 
        color: 'bg-blue-500/10 text-blue-700 border-blue-200' 
      };
    case 'users':
      return { 
        icon: Lock, 
        label: 'Authenticated Users', 
        color: 'bg-purple-500/10 text-purple-700 border-purple-200' 
      };
    default:
      return { 
        icon: Users, 
        label: 'Everyone', 
        color: 'bg-green-500/10 text-green-700 border-green-200' 
      };
  }
}

/**
 * Get authentication state from enhanced component data
 * 
 * Safely extracts authentication state added by the enhancer.
 * 
 * @param component - Enhanced component instance
 * @returns Whether the user is authenticated
 * 
 * @example
 * ```typescript
 * const isAuthenticated = getAuthState(component);
 * if (isAuthenticated) {
 *   // Show authenticated UI
 * }
 * ```
 */
export function getAuthState(component: EnhancedComponentProps<any>['component']): boolean {
  return component.data?._authState?.isAuthenticated ?? false;
}

