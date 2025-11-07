/**
 * PAGE LAYOUT COMPONENT
 * 
 * Reusable layout wrapper for pages
 * Provides consistent spacing, centering, and responsive container
 * 
 * KEY CONCEPTS:
 * 
 * 1. COMPONENT COMPOSITION:
 *    React components wrap other components using {children}
 *    Similar to master templates or partial views in other frameworks
 * 
 * 2. PROPS (Properties):
 *    Like method parameters or function arguments
 *    PageLayoutProps defines the "signature" of this component
 * 
 * 3. UTILITY FUNCTIONS:
 *    cn() = conditional class names (like string interpolation)
 *    Helps combine Tailwind classes conditionally
 * 
 * 4. TAILWIND CSS:
 *    Utility-first CSS framework
 *    className="px-4" = padding-left and padding-right of 1rem
 *    Think of it like inline styles, but with semantic names
 * 
 * USAGE EXAMPLES:
 * 
 * Basic:
 * <PageLayout>
 *   <h1>My Page</h1>
 * </PageLayout>
 * 
 * Centered (like a login page):
 * <PageLayout centered>
 *   <LoginForm />
 * </PageLayout>
 * 
 * Custom styling:
 * <PageLayout className="bg-blue-500">
 *   <Content />
 * </PageLayout>
 */

import { cn } from "@/lib/utils"

/**
 * Props interface for PageLayout component
 * 
 * Defines the parameters this component accepts
 * 
 * @property children - Content to render inside layout (required)
 * @property className - Additional CSS classes to apply (optional)
 * @property centered - Whether to vertically center content (optional, defaults to false)
 */
interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  centered?: boolean
}

/**
 * PageLayout Component
 * 
 * Provides consistent page structure with:
 * - Full height viewport
 * - Responsive container (max-width based on screen size)
 * - Consistent padding
 * - Optional vertical centering
 * 
 * @param children - Content to render inside the layout
 * @param className - Additional CSS classes to merge with defaults
 * @param centered - If true, centers content vertically (useful for login/error pages)
 */
export function PageLayout({ children, className, centered = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div
        className={cn(
          "container mx-auto px-4 py-16",
          centered && "flex items-center justify-center min-h-screen",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}


