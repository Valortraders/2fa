# Development Guide

## Prerequisites

- Node.js 20.17.0+ or 22.9.0+ (recommended: use nvm with `.nvmrc`)
- npm 9.0.0+

## Quick Start

```bash
# Use correct Node.js version
nvm use

# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build
```

## Project Structure

```
2FA/
├── auth/                    # Next.js web application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/               # Utility libraries
│   ├── public/            # Static assets
│   └── scripts/           # Build scripts
├── extension/             # Chrome extension
│   ├── src/              # Extension source code
│   ├── icons/            # Extension icons
│   └── manifest.json     # Extension manifest
├── docs/                 # Documentation
└── scripts/              # Root utility scripts
```

## Development Commands

### Root Level
- `npm run dev` - Start both auth and extension in development mode
- `npm run build` - Build both auth and extension for production
- `npm run dev:auth` - Start only the auth app
- `npm run dev:extension` - Start only the extension watcher

### Auth App (cd auth/)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Extension (cd extension/)
- `npm run watch` - Watch for changes and rebuild
- `npm run build` - Build for production
- `npm run build:css` - Build only CSS
- `npm run build:js` - Build only JavaScript

## Common Issues

### Node.js Version Warning
If you see warnings about Node.js version compatibility:
```bash
nvm install 20.17.0
nvm use 20.17.0
```

### Build Failures
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules auth/node_modules extension/node_modules
   npm install
   ```

2. Update dependencies:
   ```bash
   npx update-browserslist-db@latest
   ```

### ESLint Errors
- Check for unused variables
- Ensure all imports are used
- Run `npm run lint` in the auth directory

## Environment Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Chrome Extension Development
1. Build the extension: `npm run build:extension`
2. Open Chrome Extensions page: `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension/` folder

## Security Notes

- Never commit API keys or secrets
- Use environment variables for sensitive data
- The extension should work entirely offline for security
- TOTP secrets are stored locally in Chrome's storage API

## Contributing

1. Create a feature branch
2. Make your changes
3. Test both auth and extension
4. Run linting and type checking
5. Submit a pull request 