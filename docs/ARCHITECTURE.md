# Architecture Overview

## Project Philosophy

Valor2FA is designed as a **security-first, open-source 2FA solution** that prioritizes:

1. **Transparency** - Open source for security auditing
2. **Privacy** - No data collection, works offline
3. **Usability** - Simple, beautiful interface
4. **Compatibility** - Works with all TOTP-compatible services

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │ Chrome Extension│
│   (Next.js)     │    │   (Vanilla JS)  │
├─────────────────┤    ├─────────────────┤
│ • Landing Page  │    │ • TOTP Generator│
│ • Documentation │    │ • Account Mgmt  │
│ • Open Source   │    │ • QR Scanner    │
│ • Download Links│    │ • Secure Storage│
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Same Codebase
```

## Technology Stack

### Web Application (auth/)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Language**: TypeScript
- **3D Graphics**: Three.js (Galaxy background)
- **Deployment**: Vercel
- **SEO**: Built-in optimization

### Chrome Extension (extension/)
- **Runtime**: Manifest V3
- **Language**: Vanilla JavaScript (ES6+)
- **Crypto**: Web Crypto API
- **Storage**: Chrome Storage API
- **Build**: esbuild + Tailwind CSS

## Security Model

### Data Flow
```
User Input (Secret) → Chrome Storage API → TOTP Algorithm → Display
                           ↑
                    Encrypted locally
                    Never sent to server
```

### Security Principles
1. **Client-side only** - No server communication for TOTP generation
2. **Local storage** - Secrets stored in Chrome's encrypted storage
3. **Standard algorithms** - RFC 6238 TOTP implementation
4. **Open source** - Code is auditable
5. **No tracking** - No analytics or data collection

## Component Architecture

### Web App Components
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── privacy/page.tsx        # Privacy policy
└── terms/page.tsx          # Terms of service

components/
├── ui/                     # Reusable UI components
├── auth/                   # 2FA-specific components
├── galaxy/                 # 3D background components
├── og-image-generator.tsx  # Social media images
└── valor-symbol.tsx        # Brand logo

lib/
├── auth/totp.ts           # TOTP implementation
├── utils.ts               # Utility functions
├── error-handler.ts       # Error handling
└── rate-limiter.ts        # Rate limiting
```

### Extension Architecture
```
extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── popup.html         # Extension UI
│   ├── popup.js           # UI logic
│   ├── totp.js            # TOTP implementation
│   ├── background.js      # Service worker
│   └── styles/            # Tailwind CSS
└── icons/                 # Extension icons
```

## Build System

### Monorepo Structure
- **Root**: Workspace configuration
- **auth/**: Next.js application
- **extension/**: Chrome extension
- **docs/**: Documentation
- **scripts/**: Utility scripts

### Build Pipeline
```
npm run build
├── build:auth     → Next.js production build
└── build:extension → esbuild + Tailwind compilation
```

## Development Workflow

### Local Development
1. `npm run dev` - Starts both auth and extension watchers
2. Auth app runs on localhost:3000+
3. Extension auto-rebuilds on file changes
4. Load unpacked extension in Chrome for testing

### Production Build
1. `npm run build` - Creates production builds
2. Auth app deploys to Vercel
3. Extension creates distributable ZIP

## Security Considerations

### Threat Model
- **Malicious websites** - Extension isolated from web pages
- **Network attacks** - No network communication for TOTP
- **Local attacks** - Chrome's built-in encryption
- **Supply chain** - Open source, auditable dependencies

### Mitigations
- Content Security Policy (CSP)
- Manifest V3 security model
- No eval() or dynamic code execution
- Minimal permissions requested
- Regular dependency updates

## Performance Optimizations

### Web App
- Next.js 15 with App Router
- Static generation where possible
- Image optimization
- Code splitting
- Three.js scene optimization

### Extension
- esbuild for fast compilation
- Minimal bundle size
- Efficient TOTP calculations
- Chrome storage optimization

## Future Architecture Considerations

### Scalability
- Multi-platform support (Firefox, Safari)
- Mobile app consideration
- Desktop app potential
- API for enterprise integration

### Features
- Backup/sync capabilities
- Biometric authentication
- Hardware token support
- Advanced organization features

## Deployment Architecture

### Web App (Vercel)
```
GitHub → Vercel Build → CDN Distribution
                ↓
        Static Site Generation
        Automatic HTTPS
        Edge Functions
```

### Extension (Chrome Web Store)
```
Local Build → ZIP Package → Chrome Web Store Review → Distribution
```

## Monitoring & Analytics

### Web App
- Vercel Analytics (privacy-focused)
- Core Web Vitals monitoring
- Error tracking (client-side only)

### Extension
- No analytics or tracking
- Local error logging only
- Privacy-first approach 