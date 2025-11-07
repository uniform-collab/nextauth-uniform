"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useState } from "react"

interface OAuthButtonProps {
  provider: "github"
  callbackUrl?: string
}

const providerConfig = {
  github: {
    name: "GitHub",
    icon: Github,
    bgColor: "bg-[#24292F] hover:bg-[#24292F]/90",
  },
} as const

export function OAuthButton({ provider, callbackUrl = "/" }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const config = providerConfig[provider]

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error("OAuth sign in error:", error)
      setIsLoading(false)
    }
  }

  const Icon = config.icon

  return (
    <Button
      variant="outline"
      className={`w-full ${config.bgColor} text-white border-0`}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      <Icon className="h-5 w-5 mr-2" />
      {isLoading ? "Signing in..." : `Continue with ${config.name}`}
    </Button>
  )
}

