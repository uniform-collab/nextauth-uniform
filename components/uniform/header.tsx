/**
 * HEADER COMPONENT - Global Navigation
 * 
 * This component provides consistent navigation across all pages.
 * It displays authentication state and adapts to Canvas editor mode.
 * 
 * KEY FEATURES:
 * 1. Dynamic Authentication UI: Shows Sign In or Sign Out based on session
 * 2. Canvas Mode Support: Shows mock user in Canvas when on protected pages
 * 3. Editable Content: Logo and navigation links editable in Uniform Canvas
 */

import {
  ComponentProps,
  UniformText,
} from "@uniformdev/canvas-next-rsc/component";
import { ResolveComponentResultWithType } from "@/uniform/models";
import { getDisplayUser } from "@/lib/canvas-helpers";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "lucide-react";

export const HeaderComponent = async ({
  component,
  context,
}: ComponentProps<HeaderProps>) => {
  /**
   * USE SHARED CANVAS HELPERS
   * Centralized logic for determining user display state
   * Handles Canvas mode detection, protected route checks, and mock user display
   */
  const { displayUser, isShowingMockUser } = await getDisplayUser(context);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/en" className="hover:opacity-80 transition-opacity">
            <UniformText
              component={component}
              context={context}
              parameterId="logo"
              as="h1"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              placeholder="Enter logo text"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <UniformText
              component={component}
              context={context}
              parameterId="navigation"
              as="div"
              className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground"
              placeholder="Enter navigation"
            />
            
            {/* Auth Button - Shows real user, mock user, or sign in link */}
            {displayUser ? (
              <div className="flex items-center gap-3 relative">
                {isShowingMockUser && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded-full shadow-sm z-10">
                    👤 Mock
                  </span>
                )}
                {displayUser.name && (
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{displayUser.name}</span>
                  </div>
                )}
                {isShowingMockUser ? (
                  <button
                    disabled
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-500 bg-gray-100 cursor-not-allowed opacity-60"
                    title="Mock button for Canvas preview"
                  >
                    Sign Out
                  </button>
                ) : (
                  <SignOutButton variant="outline" size="sm" className="w-auto" />
                )}
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export type HeaderProps = {
  logo?: string;
  navigation?: string;
};

export const headerMapping: ResolveComponentResultWithType = {
  type: "header",
  component: HeaderComponent,
};
