/**
 * AUTHENTICATION CONFIGURATION
 * 
 * Centralized authentication setup using NextAuth.js
 * This file configures all authentication providers and session management
 */

import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"

/**
 * Authentication Options
 * Exported separately to be used in API routes and Server Components
 */
export const authOptions: NextAuthOptions = {
  /**
   * SECRET KEY
   * Used to encrypt JWT tokens and session cookies
   * MUST be set in production - will throw error if missing
   * 
   * Generate with: openssl rand -base64 32
   */
  secret: (() => {
    if (!process.env.AUTH_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('AUTH_SECRET environment variable is required in production!');
      }
      console.warn('⚠️  AUTH_SECRET not set - using development fallback (not secure for production)');
      return "development-secret-only-do-not-use-in-production";
    }
    return process.env.AUTH_SECRET;
  })(),
  
  /**
   * CUSTOM PAGES
   * Override default NextAuth pages with your own
   * Allows branded login/error pages
   */
  pages: {
    signIn: "/login",  // Custom login page at /login
  },
  
  /**
   * SESSION STRATEGY
   * 
   * Two options:
   * 1. "jwt" (used here): Stateless, stored in encrypted cookie
   *    - No database required for sessions
   *    - Scales horizontally (no shared state)
   * 
   * 2. "database": Stored in database
   *    - More control, can revoke sessions
   *    - Requires database queries on each request
   */
  session: {
    strategy: "jwt",
  },
  
  /**
   * AUTHENTICATION PROVIDERS
   * Multiple providers can be enabled simultaneously
   * Users can choose their preferred sign-in method
   */
  providers: [
    /**
     * GITHUB OAUTH PROVIDER
     * 
     * Setup:
     * 1. Go to GitHub → Settings → Developer settings → OAuth Apps
     * 2. Create new OAuth app
     * 3. Set callback URL: http://localhost:3000/api/auth/callback/github
     * 4. Copy Client ID and Secret to .env.local
     */
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    
    /**
     * CREDENTIALS PROVIDER (Username/Password)
     * 
     * WARNING: This is a simplified example for demo purposes
     * In production, you should:
     * - Hash passwords (bcrypt, argon2)
     * - Store in database
     * - Implement rate limiting
     * - Add CAPTCHA for brute-force protection
     * - Consider 2FA/MFA
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      /**
       * AUTHORIZATION CALLBACK
       * 
       * Called when user attempts to sign in with credentials
       * 
       * @param credentials - User-provided username and password
       * @returns User object if valid, null if invalid
       * 
       * PRODUCTION IMPLEMENTATION:
       * async authorize(credentials) {
       *   const user = await db.user.findUnique({
       *     where: { username: credentials.username }
       *   });
       *   
       *   if (!user) return null;
       *   
       *   const valid = await bcrypt.compare(
       *     credentials.password,
       *     user.passwordHash
       *   );
       *   
       *   if (!valid) return null;
       *   
       *   return {
       *     id: user.id,
       *     name: user.name,
       *     email: user.email,
       *   };
       * }
       */
      async authorize(credentials) {
        // DEMO ONLY: Hard-coded user
        // In production, verify against database with hashed passwords
        if (credentials?.username === "demo" && credentials?.password === "password") {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
          }
        }
        return null
      },
    }),
  ],
  
  /**
   * CALLBACKS
   * Lifecycle hooks to customize authentication behavior
   */
  callbacks: {
    /**
     * JWT CALLBACK
     * 
     * Called whenever a JWT token is created or updated
     * Use to add custom data to the token
     * 
     * Flow:
     * Sign in → jwt callback → session callback → page
     * 
     * @param token - Current JWT token
     * @param account - Provider account info (only on sign in)
     * @param profile - Provider profile info (only on sign in)
     * @returns Modified token
     */
    async jwt({ token, account, profile }) {
      // On initial sign in, add provider info to token
      if (account) {
        token.provider = account.provider;          // e.g., "github", "credentials"
        token.accountId = account.providerAccountId; // Provider's user ID
      }
      
      // Add profile image if available
      if (profile) {
        token.profileImage = profile.image || profile.avatar_url;
      }
      
      return token;
    },
    
    /**
     * SESSION CALLBACK
     * 
     * Called whenever session is accessed in your app
     * Use to add JWT data to the session object
     * 
     * Session is what you get when calling getServerSession() or useSession()
     * 
     * @param session - Session object (what your app sees)
     * @param token - JWT token (from jwt callback)
     * @returns Modified session
     */
    async session({ session, token }) {
      // Add provider info from token to session
      if (session.user) {
        session.user.provider = token.provider;
        session.user.accountId = token.accountId;
        session.user.image = session.user.image || token.profileImage || undefined;
      }
      
      return session;
    },
  },
}

/**
 * NEXTAUTH HANDLER
 * 
 * Creates the authentication handler for API routes
 * Automatically handles:
 * - Sign in/out
 * - Callback processing
 * - Session validation
 * - CSRF protection
 * 
 * API Routes created:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/:provider
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 */
const handler = NextAuth(authOptions);

/**
 * Export as HTTP method handlers
 * Next.js App Router requires explicit GET/POST exports
 */
export { handler as GET, handler as POST };
