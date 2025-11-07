# Next.js + Uniform Canvas + Authentication Starter

A production-ready starter template demonstrating modern content management and authentication patterns with Next.js App Router, Uniform Canvas, and NextAuth.js.

Perfect for building authenticated content experiences with visual editing capabilities.

## 🏗️ Architecture Overview

```
Request Flow:
+---------------+
|   Browser     |
+-------+-------+
        | HTTP Request
        v
+----------------------------------+
| Middleware (middleware.ts)       | <- Global request interceptor
| - Locale routing (i18n)          |
| - Authentication check           |
+--------+-------------------------+
         |
         v
+----------------------------------+
| Page Component (RSC)             | <- Server-side only
| - Fetch content from Uniform     |
| - Check authentication           |
| - Render components              |
+--------+-------------------------+
         |
         v
+----------------------------------+
| Uniform Composition              | <- Component resolution
| - Resolve component types        |
| - Pass parameters                |
| - Render tree                    |
+--------+-------------------------+
         |
         v
+----------------------------------+
| Individual Components            | <- Your rendering logic
| (Hero, Header, Footer, etc.)     |
+----------------------------------+
```

## 📁 Project Structure

```
app/                                    ← Application routes (file-based routing)
├── [locale]/                          ← Dynamic locale segment (/en, /fr)
│   ├── page.tsx                       ← Root page handler (/)
│   ├── cms/[[...path]]/               ← CMS catch-all routes
│   └── cms-protected/[[...path]]/     ← Auth-required CMS routes
├── api/                               ← API endpoints
│   ├── auth/[...nextauth]/           ← Authentication API (NextAuth.js)
│   │   └── route.ts                  ← Exports handlers from auth.ts
│   └── preview/                       ← Uniform Canvas preview endpoint
│       └── route.ts                  ← Canvas editor integration
├── login/                            ← Login page
│   └── page.tsx
├── playground/                       ← Uniform Canvas playground
│   └── page.tsx
├── layout.tsx                        ← Root layout (wraps all pages)
└── globals.css                       ← Global styles

components/
├── uniform/                          ← Uniform Canvas components
│   ├── hero.tsx                      ← Hero with access control
│   ├── header.tsx                    ← Header with auth-aware navigation
│   ├── footer.tsx                    ← Footer component
│   ├── content-block.tsx             ← Content block component
│   ├── access-denied.tsx             ← Access denied component
│   ├── page.tsx                      ← Page wrapper component
│   └── index.ts                      ← Component exports
├── auth/                             ← Authentication components
│   ├── user-info-badge.tsx           ← User info display
│   ├── oauth-providers.tsx           ← OAuth provider buttons
│   └── ...
├── layout/                           ← Layout components
│   └── page-layout.tsx               ← Consistent page wrapper
└── ui/                               ← Reusable UI components (shadcn/ui)

lib/
├── canvas-helpers.ts                 ← Canvas mode detection utilities
├── component-helpers.ts              ← Reusable component utilities
└── utils.ts                          ← Utility functions

types/
├── next-auth.d.ts                    ← NextAuth type extensions
└── uniform.ts                        ← Custom Uniform type definitions

uniform/
├── clientContext.tsx                 ← Uniform Canvas client setup
├── resolve.tsx                       ← Component type → React component mapper
├── mappings.ts                       ← Component registration
├── models.ts                         ← Type definitions
├── enhancers/                        ← Data enhancers (pre-processing)
│   ├── access-control-enhancer.ts   ← Access control enhancer
│   └── index.ts                      ← Enhancer exports
└── l18n/
    ├── localeHelper.ts               ← Locale path formatting
    └── locales.json                  ← Supported locales config

uniform-data/                         ← Uniform configuration (YAML)
├── component/                        ← Component definitions
├── composition/                      ← Page compositions
└── projectMapNode/                   ← URL routing structure

middleware.ts                         ← Global request handler
auth.ts                               ← Authentication configuration
uniform.config.ts                     ← Uniform CLI configuration
uniform.server.config.js              ← Uniform server config
.env.example                          ← Environment variables template
```

## 🔑 Key Concepts

### 1. React Server Components (RSC)

**What it is:** Components that run ONLY on the server, never shipped to the client.

```typescript
// This is a Server Component - it can be async!
export default async function Page() {
  // Direct database access - runs on server only
  const data = await database.query();
  
  // Direct authentication check - secure
  const session = await getServerSession();
  
  return <div>{data.title}</div>;
}
```

**Benefits:**
- Zero JavaScript sent to browser for these components
- Direct server-side resource access (databases, files, APIs)
- Secure - code never exposed to client
- Better performance - less client-side JavaScript

### 2. File-Based Routing

**What it is:** URL structure defined by folder/file names instead of configuration.

| File Path | URL | Notes |
|-----------|-----|-------|
| `app/page.tsx` | `/` | Root page |
| `app/about/page.tsx` | `/about` | Static route |
| `app/[locale]/page.tsx` | `/en`, `/fr` | Dynamic segment |
| `app/blog/[...slug]/page.tsx` | `/blog/a/b/c` | Catch-all |

**Dynamic Segments:**
- `[param]` = required dynamic segment
- `[[...param]]` = optional catch-all
- `[...param]` = required catch-all

### 3. Middleware

**What it is:** Global request interceptor that runs before any page.

```typescript
// middleware.ts - runs on EVERY request
export default function middleware(request) {
  // Check authentication
  // Redirect based on locale
  // Add custom headers
  // etc.
}
```

### 4. Uniform Canvas Integration

**What it is:** Headless CMS providing visual editing experience.

**How it works:**
1. Content authors use Uniform Canvas UI (cloud-based)
2. Create pages by adding components
3. Set component parameters
4. Publish changes
5. Your Next.js app fetches content via API
6. Components render with the content

**Preview/Edit Mode:**
- Uniform sends preview request to `/api/preview`
- Next.js enables Draft Mode (secure preview)
- Page loads with Canvas editor UI overlay
- Content editable inline

### 5. Authentication (NextAuth.js)

**What it is:** Complete authentication solution for Next.js.

**Supported methods:**
- OAuth (GitHub, Google, etc.)
- Email/Password (Credentials provider)
- Magic Links
- JWT tokens

**Security features:**
- Session management (cookies or JWT)
- CSRF protection
- Secure password hashing
- Provider-agnostic

### 6. Uniform Enhancers (Data Pre-Processing)

**What it is:** Server-side functions that add metadata to components before rendering.

**How it works:**
1. Fetch composition from Uniform
2. Run enhancers to add data properties (e.g., auth state, access control)
3. Filter/modify composition based on enhanced data
4. Render final composition

**Example:**
```typescript
// uniform/enhancers/access-control-enhancer.ts
export function createAccessControlEnhancer() {
  return new EnhancerBuilder()
    .data('_authState', async ({ context }) => ({
      isAuthenticated: !!context.session?.user,
      user: context.session?.user || null,
    }))
    .data('_accessControl', async ({ component, context }) => {
      // Determine if user has access to this component
      const accessType = component.parameters?.accessType?.value;
      const isAuthenticated = !!context.session?.user;
      
      if (accessType === 'users' && !isAuthenticated) {
        return { allowed: false, reason: 'requires-auth' };
      }
      
      return { allowed: true, reason: 'authorized' };
    });
}
```

**Benefits:**
- **Process once, use everywhere**: Enhanced data available to all components
- **Type-safe**: Full TypeScript support with `EnhancedComponentProps`
- **Separation of concerns**: Access logic separate from UI components
- **Reusable**: Same enhancer works across all pages

**Usage in pages:**
```typescript
// Run enhancer to add metadata
await enhance({
  composition,
  enhancers: createAccessControlEnhancer(),
  context: { session, isCanvasMode },
});

// Filter unauthorized components (skipped in Canvas mode)
if (!isCanvasMode) {
  filterUnauthorizedComponents(composition);
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (JavaScript runtime)
- npm or yarn (package manager)
- Uniform account and API keys

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Copy .env.example to .env and fill in your values
cp .env.example .env
# Then edit .env with your actual values

# 3. Pull Uniform configuration
npm run uniform:pull

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

Create `.env` file based on `.env.example`:

```env
# Authentication (Required)
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Uniform CMS (Required)
UNIFORM_API_KEY=your-api-key
UNIFORM_PROJECT_ID=your-project-id
UNIFORM_PREVIEW_SECRET=your-preview-secret

# Uniform Data Residency (Optional - defaults to US)
UNIFORM_CLI_BASE_URL=https://uniform.app
UNIFORM_CLI_BASE_EDGE_URL=https://uniform.global
UNIFORM_API_HOST=https://uniform.app
UNIFORM_EDGE_API_HOST=https://uniform.global
# For EU region, use: https://eu.uniform.app and https://eu.uniform.global

# OAuth Providers (Optional)
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret
```

**⚠️ Security Note:** `AUTH_SECRET` is **required in production** - the app will fail to start without it. Generate a secure secret with `openssl rand -base64 32`.

**🌍 Data Residency:** Uniform supports both US and EU data residency. Configure the appropriate endpoints based on your data compliance requirements:
- **US Region**: `uniform.app` and `uniform.global` (default)
- **EU Region**: `eu.uniform.app` and `eu.uniform.global`

See [Uniform documentation](https://docs.uniform.app) for more information.

## 🎨 Adding New Components

### Step 1: Define Component in Uniform

Create YAML definition in `uniform-data/component/`:

```yaml
# my-component.yaml
component:
  id: my-component-id
  type: my-component
  parameters:
    - id: title
      type: text
    - id: description
      type: text
```

### Step 2: Create React Component

```typescript
// components/uniform/my-component.tsx
import { ComponentProps, UniformText } from "@uniformdev/canvas-next-rsc/component";
import { ResolveComponentResultWithType } from "@/uniform/models";

export const MyComponent = ({ component, context }: ComponentProps) => {
  return (
    <div>
      <UniformText
        component={component}
        context={context}
        parameterId="title"
        as="h2"
        placeholder="Enter title"
      />
    </div>
  );
};

export const myComponentMapping: ResolveComponentResultWithType = {
  type: "my-component",
  component: MyComponent,
};
```

### Step 3: Register Component

```typescript
// uniform/mappings.ts
export { myComponentMapping } from "../components/uniform/my-component";
```

### Step 4: Push to Uniform

```bash
npm run uniform:push
```

## 🔐 Authentication Implementation

### Route Protection

Three approaches demonstrated:

#### 1. Middleware-Based (Route-Level)

```typescript
// middleware.ts
export default withAuth(handler, {
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith('/protected')) {
        return !!token;
      }
      return true;
    },
  },
});
```

#### 2. Page-Level

```typescript
// app/protected/page.tsx
export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Protected content</div>;
}
```

#### 3. Component-Level (Enhancer-Based Access Control)

This project uses **Uniform Enhancers** for sophisticated, server-side component access control.

**Architecture:**
1. **Enhancer adds metadata** to all components during composition processing
2. **Filter removes unauthorized** components before rendering (unless in Canvas)
3. **Components use enhanced data** for display logic (no manual session checks)

**Page Implementation:**

```typescript
// app/[locale]/cms/[[...path]]/page.tsx
import { enhance } from "@uniformdev/canvas";
import { 
  createAccessControlEnhancer, 
  filterUnauthorizedComponents 
} from "@/uniform/enhancers";

export default async function CMSPage(props: PageParameters) {
  const session = await getServerSession(authOptions);
  const composition = route.compositionApiResponse?.composition;
  
  if (composition) {
    // Step 1: Run enhancer to add auth metadata to all components
    await enhance({
      composition,
      enhancers: createAccessControlEnhancer(),
      context: {
        preview: isDraftMode,
        isCanvasMode,
        session,
      },
    });
    
    // Step 2: Remove unauthorized components (skipped in Canvas mode)
    if (!isCanvasMode) {
      filterUnauthorizedComponents(composition);
    }
  }
  
  return <UniformComposition {...props} route={route} />;
}
```

**Component Implementation:**

```typescript
// components/uniform/hero.tsx
import type { EnhancedComponentProps } from "@/uniform/enhancers";
import { getAuthState, getAccessType } from "@/lib/component-helpers";

export const Hero = async ({
  component,
  context,
}: EnhancedComponentProps<HeroProps>) => {
  // Access enhanced data - no manual session check needed!
  const isAuthenticated = getAuthState(component);
  const accessType = getAccessType(component);
  
  return (
    <div>
      <h1>{component.parameters.title}</h1>
      {/* Component automatically filtered if user lacks access */}
      {isAuthenticated && <p>Welcome back!</p>}
    </div>
  );
};
```

**Benefits:**
- ✅ **Centralized logic**: Access control in one place (enhancer)
- ✅ **Type-safe**: Full TypeScript support with `EnhancedComponentProps`
- ✅ **Canvas-aware**: Editors see all components regardless of access settings
- ✅ **Secure**: Server-side filtering prevents unauthorized access
- ✅ **Clean DOM**: Unauthorized components completely removed, not just hidden
- ✅ **Reusable helpers**: Shared utilities for common patterns

**Note:** This is authentication-based personalization (secure personalization), distinct from Uniform's built-in personalization features (which handle visitor targeting, A/B testing, etc.). This approach uses server-side authentication to control content visibility for security purposes.

## 🌍 Internationalization (i18n)

### How It Works

1. **Middleware** checks for locale in URL
2. Redirects if missing: `/about` → `/en/about`
3. **Page components** receive locale as parameter
4. **Uniform** serves locale-specific content
5. Components render in correct language

### Adding New Locale

1. Add to `uniform/l18n/locales.json`:
```json
{
  "locales": ["en", "fr", "nl"],
  "localeNames": {
    "en": "English",
    "fr": "Français",
    "nl": "Nederlands"
  },
  "defaultLocale": "en"
}
```

2. Update middleware to include new locale
3. Create locale in Uniform Canvas
4. Translate content in Canvas UI

## 📝 Common Patterns

### Fetching External Data

```typescript
// In any Server Component
export default async function Page() {
  // Direct API calls - no useEffect needed!
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

### Client-Side Interactivity

When you need JavaScript in the browser:

```typescript
// Add "use client" directive
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Mixing Server and Client

```typescript
// page.tsx (Server Component)
import { ClientComponent } from './client-component';

export default async function Page() {
  // Server-side data fetch
  const data = await fetchData();
  
  return (
    <div>
      <h1>Server rendered: {data.title}</h1>
      {/* Pass data to client component */}
      <ClientComponent initialData={data} />
    </div>
  );
}
```

## 🛠️ Development Workflow

### Local Development

```bash
# Start dev server with hot reload
npm run dev

# Pull latest from Uniform
npm run uniform:pull

# Push local changes to Uniform
npm run uniform:push
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### Debugging

1. **Server Components:** `console.log()` appears in terminal
2. **Client Components:** `console.log()` appears in browser
3. **Middleware:** Add logging to see request flow
4. **Uniform Issues:** Check preview API logs

## 🔧 Configuration Files

### next.config.js
Next.js configuration (build settings, image domains, etc.)

### tsconfig.json
TypeScript configuration (strict mode, path aliases)

### package.json
Dependencies and scripts

### uniform.config.ts
Uniform CLI configuration

### types/uniform.ts
Custom TypeScript type definitions for Uniform objects (`LocalePageParameters`, `UniformServerContextExtended`, etc.)

### lib/component-helpers.ts
Reusable utility functions for components (`detectCanvasMode`, `getAuthState`, `getAccessType`, etc.)

## 📚 Key Terminology

| Term | Meaning |
|------|---------|
| RSC | React Server Component - runs only on server |
| SSR | Server-Side Rendering - dynamic page rendering |
| SSG | Static Site Generation - pre-built pages |
| ISR | Incremental Static Regeneration - cached with refresh |
| Hydration | Adding interactivity to server-rendered HTML |
| Route Handler | API endpoint function |
| Middleware | Request interceptor |
| Dynamic Route | URL with parameters |
| Catch-all | Wildcard route segment |
| Enhancer | Server-side function that pre-processes composition data |
| Composition | Content structure from Uniform (page layout + components) |
| Draft Mode | Next.js preview mode for secure content editing |
| Canvas Mode | Uniform's visual editing interface |

## 🔒 Security

This project implements several security best practices:

### ✅ What's Secure

1. **Server-Side Authentication**
   - All auth checks run on the server (cannot be bypassed client-side)
   - JWT tokens encrypted with secret key
   - HTTP-only cookies prevent XSS token theft

2. **Environment Variable Protection**
   - `.env` excluded from git
   - `AUTH_SECRET` required in production (app fails to start if missing)
   - Separate secrets for different environments

3. **Canvas Preview Security**
   - Requires **both** `is_incontext_editing_mode=true` AND valid `secret` parameter
   - Prevents unauthorized access via URL manipulation
   - Preview secret validated server-side

4. **CSRF Protection**
   - NextAuth.js includes built-in CSRF protection
   - All state-changing requests validated

5. **Middleware-Based Access Control**
   - Runs before any page code executes
   - Cannot be bypassed by route manipulation
   - Centralized authorization logic

### ⚠️ Important Security Notes

1. **Demo Credentials**
   - Hardcoded demo user (`demo/password`) is for development only
   - **Remove or disable in production**
   - Use environment variables if demo needed: `DEMO_USER`, `DEMO_PASSWORD`

2. **OAuth Provider Configuration**
   - Use separate OAuth apps for dev/staging/production
   - Keep client secrets secure
   - Configure proper callback URLs

3. **Secrets Management**
   - Never commit `.env` to version control
   - Use platform secret managers in production (Vercel, AWS Secrets Manager, etc.)
   - Rotate secrets periodically
   - Use different secrets per environment

4. **Rate Limiting**
   - Currently **not implemented** for credential login
   - Recommended: Add rate limiting middleware for production
   - Consider CAPTCHA after failed attempts

### 🛡️ Recommended Production Hardening

Before deploying to production, consider:

1. **Add Security Headers**
```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

2. **Whitelist Image Domains**
   - Replace wildcard `hostname: "*"` with specific domains
   - Prevents loading malicious images

4. **Add Rate Limiting**
   - Use `next-rate-limit` or similar
   - Protect login endpoints

5. **Implement Logging & Monitoring**
   - Log failed auth attempts
   - Monitor for suspicious patterns
   - Set up alerts for security events

## 🎓 Learning Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Uniform Docs:** https://docs.uniform.app
- **React Server Components:** https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components
- **NextAuth.js:** https://next-auth.js.org
- **OWASP Security:** https://owasp.org/www-project-top-ten/

## 🤝 Support

For questions specific to:
- **Next.js:** GitHub Discussions
- **Uniform:** Support Portal
- **This implementation:** Internal team channels

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR:** Free to use for personal and commercial projects. No restrictions, just include the license notice.
