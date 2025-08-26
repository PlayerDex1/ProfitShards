# Cloudflare Pages Configuration

## Build Settings
- **Build command**: `npm run build`
- **Build output directory**: `dist/public`
- **Root directory**: `/` (project root)
- **Node.js version**: 18.x or latest

## Environment Variables
```
NODE_ENV=production
```

## Deploy Status
- **Last successful build**: Manual build working
- **Auto-deploy**: Should be enabled for `main` branch
- **Build system**: Vite + React + TypeScript

## Troubleshooting
1. Verify GitHub integration is connected
2. Check Cloudflare Pages dashboard for build logs
3. Ensure webhook is properly configured
4. Manual build works - deploy directory: `dist/public`

## Files Structure
```
dist/public/
├── index.html          (1.6KB)
├── assets/             (844KB)
├── manifest.webmanifest
├── sw.js
├── _redirects
├── _headers
└── vite.svg
```

Last updated: 2025-08-26T09:37:52Z