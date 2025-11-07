import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      provider?: string
      accountId?: string
    } & DefaultSession["user"]
  }

  interface User {
    provider?: string
    accountId?: string
  }

  interface Profile {
    avatar_url?: string
    login?: string
    id?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string
    accountId?: string
    profileImage?: string
  }
}

