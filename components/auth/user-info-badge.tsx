import { User, Github, KeyRound, Mail, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserInfoBadgeProps {
  name: string
  email?: string
  provider?: string
  image?: string
  accountId?: string
  label?: string
}

export function UserInfoBadge({ 
  name, 
  email,
  provider,
  image,
  accountId,
  label = "Logged in as" 
}: UserInfoBadgeProps) {
  const getProviderIcon = () => {
    switch (provider) {
      case "github":
        return <Github className="h-4 w-4" />
      case "credentials":
        return <KeyRound className="h-4 w-4" />
      default:
        return <ShieldCheck className="h-4 w-4" />
    }
  }

  const getProviderLabel = () => {
    switch (provider) {
      case "github":
        return "GitHub OAuth"
      case "credentials":
        return "Email & Password"
      default:
        return "Unknown Provider"
    }
  }

  const getProviderColor = () => {
    switch (provider) {
      case "github":
        return "bg-gray-900 text-white hover:bg-gray-800"
      case "credentials":
        return "bg-blue-600 text-white hover:bg-blue-700"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg">
            {name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Badge variant="secondary" className={getProviderColor()}>
              {getProviderIcon()}
              <span className="ml-1.5">{getProviderLabel()}</span>
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <p className="font-semibold text-lg">{name}</p>
            </div>
            
            {email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            )}
            
            {accountId && provider === "github" && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-mono">
                  Account ID: {accountId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

