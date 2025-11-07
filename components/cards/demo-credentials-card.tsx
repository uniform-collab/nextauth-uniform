import { Card, CardContent } from "@/components/ui/card"

interface DemoCredentialsCardProps {
  variant?: "default" | "compact"
}

export function DemoCredentialsCard({ variant = "default" }: DemoCredentialsCardProps) {
  if (variant === "compact") {
    return (
      <div className="p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Demo credentials:</strong>
          <br />
          Username: demo
          <br />
          Password: password
        </p>
      </div>
    )
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Demo credentials:</strong>
          <br />
          Username: <code className="text-xs bg-background px-1 py-0.5 rounded">demo</code>
          <br />
          Password: <code className="text-xs bg-background px-1 py-0.5 rounded">password</code>
        </p>
      </CardContent>
    </Card>
  )
}


