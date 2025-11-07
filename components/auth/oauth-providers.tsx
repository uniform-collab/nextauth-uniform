"use client"

import { OAuthButton } from "./oauth-button"
import { AuthDivider } from "./auth-divider"

interface OAuthProvidersProps {
  showDivider?: boolean
  callbackUrl?: string
}

export function OAuthProviders({ showDivider = true, callbackUrl }: OAuthProvidersProps) {
  return (
    <div className="space-y-4">
      <OAuthButton provider="github" callbackUrl={callbackUrl} />
      {showDivider && <AuthDivider />}
    </div>
  )
}


