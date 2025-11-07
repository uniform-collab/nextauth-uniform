"use client"

import * as React from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}

export function SignOutButton({ 
  size, 
  variant = "outline",
  className = "w-full" 
}: SignOutButtonProps) {
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={() => signOut({ callbackUrl: "/" })} 
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
