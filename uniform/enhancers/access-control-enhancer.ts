/**
 * ACCESS CONTROL ENHANCER
 * 
 * Uses Uniform's enhancer system to filter components based on access control
 * and provide authentication state to all components.
 * 
 * This enhancer adds two data properties to every component:
 * - `_authState`: Current user authentication state
 * - `_accessControl`: Access control decision metadata
 * 
 * Then provides a post-processing function to remove unauthorized components.
 * 
 * Benefits:
 * - Leverages Uniform's official enhancer system
 * - Single source of authentication state (no duplicate getServerSession calls)
 * - Components are removed before rendering (cleaner DOM, better security)
 * - Centralized access control logic
 * - Canvas mode automatically bypasses filtering
 * - Type-safe with EnhancedComponentProps
 * 
 * Learn more: https://docs.uniform.app/docs/guides/composition/enhancers
 */

import { 
  EnhancerBuilder, 
  type ComponentEnhancerOptions,
  type ComponentInstance,
  type RootComponentInstance 
} from '@uniformdev/canvas';
import type { ComponentProps as UniformComponentProps } from '@uniformdev/canvas-next-rsc/component';
import type { Session } from 'next-auth';

/**
 * Access control result
 */
interface AccessControlResult {
  allowed: boolean;
  reason: 'canvas-mode' | 'everyone' | 'requires-auth' | 'anonymous-only' | 'authorized';
}

/**
 * Authentication state added to component data by enhancer
 */
export interface EnhancedAuthState {
  isAuthenticated: boolean;
  user: unknown | null;
}

/**
 * Enhanced component data structure
 * Components can use this to access enhancer-added data with type safety
 */
export interface EnhancedComponentData {
  _authState?: EnhancedAuthState;
  _accessControl?: AccessControlResult;
  [key: string]: unknown;
}

/**
 * Enhanced component instance with typed data
 * Use this to get proper types for component.data in your components
 */
export interface EnhancedComponentInstance {
  data?: EnhancedComponentData;
  [key: string]: unknown;
}

/**
 * Enhanced ComponentProps with typed component data
 * 
 * Use this instead of the default ComponentProps in your components
 * to get proper types for enhancer-added data.
 * 
 * @example
 * ```typescript
 * import type { EnhancedComponentProps } from '@/uniform/enhancers';
 * 
 * export const MyComponent = async ({
 *   component,
 *   context,
 * }: EnhancedComponentProps<MyProps>) => {
 *   // component.data is now properly typed!
 *   const isAuthenticated = component.data?._authState?.isAuthenticated ?? false;
 * };
 * ```
 */
export type EnhancedComponentProps<TParams = Record<string, unknown>> = Omit<UniformComponentProps<TParams>, 'component'> & {
  component: UniformComponentProps<TParams>['component'] & EnhancedComponentInstance;
};

/**
 * Enhanced context type for access control
 * Pass this as the context when calling enhance()
 */
export interface AccessControlEnhancerContext {
  preview?: boolean;
  isCanvasMode?: boolean;
  session?: Session | null;
  [key: string]: unknown;
}

/**
 * Creates the access control enhancer
 * 
 * This enhancer adds two data properties to every component:
 * 1. `_accessControl` - Information about access control decisions
 * 2. `_authState` - Current user authentication state
 * 
 * @returns EnhancerBuilder configured with access control logic
 * 
 * @example
 * ```typescript
 * import { enhance } from '@uniformdev/canvas';
 * import { createAccessControlEnhancer } from '@/uniform/enhancers';
 * 
 * await enhance({
 *   composition: route.compositionApiResponse.composition,
 *   enhancers: createAccessControlEnhancer(),
 *   context: {
 *     preview: isDraftMode,
 *     isCanvasMode,
 *     session,
 *   },
 * });
 * ```
 */
export function createAccessControlEnhancer() {
  return new EnhancerBuilder()
    // Add authentication state to every component
    .data('_authState', async ({ context }: ComponentEnhancerOptions<AccessControlEnhancerContext>) => {
      const enhancerContext = context as AccessControlEnhancerContext;
      return {
        isAuthenticated: !!enhancerContext.session?.user,
        user: enhancerContext.session?.user || null,
      };
    })
    // Add access control data to every component
    .data('_accessControl', async ({ component, context }: ComponentEnhancerOptions<AccessControlEnhancerContext>) => {
      const enhancerContext = context as AccessControlEnhancerContext;
      
      // Skip access control in Canvas mode - editors need to see everything
      if (enhancerContext.isCanvasMode) {
        return { allowed: true, reason: 'canvas-mode' } as AccessControlResult;
      }
      
      // Get the component's accessType parameter
      const accessType = component.parameters?.accessType?.value as string | undefined;
      
      // Default to 'everyone' if not specified
      if (!accessType || accessType === 'everyone') {
        return { allowed: true, reason: 'everyone' } as AccessControlResult;
      }
      
      // Check authentication state
      const isAuthenticated = !!enhancerContext.session?.user;
      
      // Apply access control rules
      if (accessType === 'users' && !isAuthenticated) {
        return { allowed: false, reason: 'requires-auth' } as AccessControlResult;
      }
      
      if (accessType === 'anonymous' && isAuthenticated) {
        return { allowed: false, reason: 'anonymous-only' } as AccessControlResult;
      }
      
      return { allowed: true, reason: 'authorized' } as AccessControlResult;
    });
}

/**
 * Post-processing function to remove components with denied access
 * 
 * Call this after running enhance() to filter out components where
 * _accessControl.allowed === false
 * 
 * This walks the composition tree and removes any components that failed
 * access control checks.
 * 
 * @param composition - The root composition instance
 * 
 * @example
 * ```typescript
 * // After enhancement
 * await enhance({
 *   composition,
 *   enhancers: createAccessControlEnhancer(),
 *   context: { ... },
 * });
 * 
 * // Filter out unauthorized components
 * filterUnauthorizedComponents(composition);
 * ```
 */
export function filterUnauthorizedComponents(composition: RootComponentInstance | ComponentInstance): void {
  /**
   * Recursively filter components in a slot
   */
  function filterSlot(components: ComponentInstance[]): ComponentInstance[] {
    return components
      .filter((component) => {
        // Check if component has access control data
        const accessControl = component.data?._accessControl as AccessControlResult | undefined;
        
        // If no access control data, allow by default
        if (!accessControl) return true;
        
        // Filter based on allowed flag
        return accessControl.allowed !== false;
      })
      .map((component) => {
        // Recursively filter nested components in child slots
        if (component.slots) {
          Object.keys(component.slots).forEach((slotName) => {
            const slot = component.slots![slotName];
            if (Array.isArray(slot)) {
              component.slots![slotName] = filterSlot(slot);
            }
          });
        }
        return component;
      });
  }
  
  // Filter all slots in the root composition
  if (composition.slots) {
    Object.keys(composition.slots).forEach((slotName) => {
      const slot = composition.slots![slotName];
      if (Array.isArray(slot)) {
        composition.slots![slotName] = filterSlot(slot);
      }
    });
  }
}
