/**
 * HERO COMPONENT - Content-Managed Hero Section
 * 
 * This is a Uniform Canvas component with integrated access control.
 * Demonstrates key concepts for content-managed, security-aware components.
 * 
 * KEY FEATURES:
 * 1. Server-Side Rendering (RSC)
 * 2. Content Management Integration (Uniform Canvas)
 * 3. Role-Based Access Control (RBAC) via Enhancers
 * 4. Canvas Editor Support with Mock Data
 * 5. Reusable Component Helpers
 * 
 * ARCHITECTURE:
 * - Access control is enforced by page-level enhancers
 * - Components receive enhanced data with auth state
 * - Shared logic extracted to lib/component-helpers.ts
 * - Type-safe with EnhancedComponentProps
 */

import {
  UniformRichText,
  UniformText,
} from "@uniformdev/canvas-next-rsc/component";
import { ResolveComponentResultWithType } from "@/uniform/models";
import { ShieldCheck, ShieldOff } from "lucide-react";
import type { EnhancedComponentProps } from "@/uniform/enhancers";
import { detectCanvasMode, getAccessType, getAccessInfo, getAuthState } from "@/lib/component-helpers";

/**
 * Hero Component - Main export
 */
export const HeroComponent = async ({
  component,
  context,
}: EnhancedComponentProps<HeroProps>) => {
  /**
   * CANVAS MODE DETECTION
   * 
   * Detect if we're in Canvas editor mode with security verification.
   * Uses helper function to avoid code duplication across components.
   */
  const canvasMode = await detectCanvasMode(context);
  
  /**
   * ACCESS TYPE PARAMETER
   * 
   * Retrieves the access type configured for this component in Uniform Canvas.
   * 
   * NOTE: Access control enforcement is handled by the page-level enhancer.
   * This component uses the accessType only for displaying badges/indicators.
   * The enhancer filters unauthorized components before they reach rendering.
   * 
   * HOW TO CONFIGURE IN UNIFORM:
   * 1. Select this Hero component in the Canvas editor
   * 2. In the right panel, find the "Access Type" dropdown parameter
   * 3. Choose one of these options:
   *    - "Everyone" (everyone): Visible to all visitors (default)
   *    - "Authenticated Users" (users): Only visible to logged-in users
   *    - "Anonymous Only" (anonymous): Only visible to non-logged-in visitors
   * 
   * The enhancer evaluates these rules and removes unauthorized components.
   */
  const accessType = getAccessType(component);
  const accessInfo = getAccessInfo(accessType);
  const AccessIcon = accessInfo.icon;

  /**
   * CANVAS EDITOR MODE RENDERING
   * 
   * When in Canvas, always show component regardless of access control
   * This allows content authors to edit all components
   * 
   * Visual indicator added to distinguish editor from production mode
   * Shows whether user is in Edit Mode (actively editing) or Preview Mode (viewing changes)
   */
  if (canvasMode.isSecureCanvasMode) {
    
    return (
      <div className="relative container mx-auto px-4 py-20 my-12 text-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        </div>

        {/* Canvas Mode Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${canvasMode.modeColor} text-white text-xs font-medium rounded-full shadow-lg`}>
            <span>{canvasMode.modeIcon}</span>
            <span>Canvas {canvasMode.canvasMode}</span>
          </div>
        </div>

        {/* Access Level Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <AccessIcon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Visibility: {accessInfo.label}</span>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto space-y-6">
          <UniformText
            component={component}
            context={context}
            parameterId="title"
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight tracking-tight"
            placeholder="Enter hero title"
          />
          <UniformRichText
            component={component}
            parameterId="description"
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
            placeholder="Enter hero description"
          />
        </div>

        {/* Visual indicator - subtle */}
        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-blue-300/50 pointer-events-none" />
      </div>
    );
  }
  
  /**
   * PRODUCTION MODE: Get authentication state from enhancer
   * 
   * Note: Access control filtering is handled by the enhancer at the page level.
   * If this component is rendering, the user has already passed the access check.
   * 
   * Authentication state is provided by the enhancer via component.data._authState
   * This avoids duplicate getServerSession calls in every component.
   */
  const isAuthenticated = getAuthState(component);
  /**
   * PRODUCTION MODE RENDERING
   * 
   * Renders component with access control indicators showing:
   * - Access level badge: Configured visibility rule
   * - Auth status badge: Current user authentication state
   * - Content: Title and description from Uniform Canvas
   * 
   * UniformText/UniformRichText components:
   * - Render content from Uniform Canvas
   * - Handle localization automatically
   * - parameterId maps to field in Uniform
   * - Placeholders shown in Canvas when field is empty
   */
  return (
    <div className="relative container mx-auto px-4 py-20 my-12 text-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      {/* Access Control Indicator */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-2">
            <AccessIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Access: <span className="text-gray-900 font-semibold">{accessInfo.label}</span>
            </span>
          </div>
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">✓ Authenticated</span>
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">Anonymous</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto space-y-6">
        <UniformText
          component={component}
          context={context}
          parameterId="title"
          as="h1"
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight tracking-tight"
          placeholder="Enter hero title"
        />
        <UniformRichText
          component={component}
          parameterId="description"
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
          placeholder="Enter hero description"
        />
      </div>
    </div>
  );
};

/**
 * TYPE DEFINITION
 */
export type HeroProps = {
  title: string;
  description: string;
  accessType?: 'anonymous' | 'users' | 'everyone';
};

/**
 * COMPONENT REGISTRATION
 */
export const heroMapping: ResolveComponentResultWithType = {
  type: "hero",
  component: HeroComponent,
};
