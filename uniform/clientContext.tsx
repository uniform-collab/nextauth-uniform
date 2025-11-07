/**
 * UNIFORM CLIENT CONTEXT - Canvas Editor Integration
 * 
 * This component provides client-side functionality for Uniform Canvas:
 * - Visual editing capabilities
 * - Personalization tracking
 * - A/B testing
 * - Analytics integration
 * 
 * Important: This is a CLIENT component (runs in browser)
 * The "use client" directive is required
 */

"use client";

import {
  ClientContextComponent,
  createClientUniformContext,
  useInitUniformContext,
} from "@uniformdev/canvas-next-rsc/component";
import {
  ContextPlugin,
  enableContextDevTools,
} from "@uniformdev/context";
import { useRouter } from "next/navigation";

/**
 * UNIFORM CLIENT CONTEXT COMPONENT
 * 
 * Initializes Uniform's client-side context for:
 * 1. Canvas Editor: Enables visual editing in Uniform UI
 * 2. Personalization: Tracks visitor data for targeted content
 * 3. Analytics: Captures component interactions
 * 
 * IMPORTANT: This returns null (renders nothing visible)
 * It only initializes client-side tracking and editing capabilities
 */
export const UniformClientContext: ClientContextComponent = ({
  manifest,
  experimentalQuirkSerialization,
  defaultConsent,
}) => {
  // Next.js router for navigation after Canvas updates
  const router = useRouter();
  
  /**
   * INITIALIZE UNIFORM CONTEXT
   * 
   * Called once when component mounts
   * Sets up plugins and tracking
   */
  useInitUniformContext(() => {
    const plugins: ContextPlugin[] = [];

    /**
     * CONTEXT DEV TOOLS PLUGIN
     * 
     * Enables communication between Uniform Canvas and your app
     * 
     * Features:
     * - Listens for content changes in Canvas
     * - Refreshes page when content is updated
     * - Provides debug information
     * 
     * onAfterMessageReceived: Called when Canvas updates content
     * router.refresh(): Reloads page data (Server Components)
     */
    plugins.push(
      enableContextDevTools({
        onAfterMessageReceived: () => {
          // Refresh the page to show updated content
          // This triggers Server Components to re-fetch data
          router.refresh();
        },
      })
    );

    /**
     * OPTIONAL PLUGINS (commented out)
     * 
     * UNIFORM INSIGHTS:
     * Tracks component impressions and interactions
     * Useful for content performance analytics
     * 
     * GOOGLE ANALYTICS:
     * Integrates with GA4 for unified tracking
     * Requires: npm install @uniformdev/context-gtag
     * 
     * To enable: Uncomment and configure below
     */
    
    // plugins.push(
    //   enableUniformInsights({
    //     endpoint: {
    //       type: "proxy",
    //       path: "/api/analytics",
    //     },
    //   })
    // );
    
    // plugins.push(enableGoogleGtagAnalytics());

    /**
     * CREATE CONTEXT
     * 
     * Initializes Uniform's context engine with:
     * @param manifest - Project configuration from server
     * @param plugins - Enabled feature plugins
     * @param defaultConsent - GDPR/privacy consent settings
     * @param experimental_quirksEnabled - Feature flags
     */
    return createClientUniformContext({
      manifest,
      plugins,
      defaultConsent,
      experimental_quirksEnabled: experimentalQuirkSerialization,
    });
  });

  /**
   * RENDER NOTHING
   * 
   * This component has no visual output
   * It only provides client-side functionality
   * 
   * The context is accessed by other Uniform components automatically
   */
  return null;
};
