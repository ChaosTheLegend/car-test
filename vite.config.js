import { defineConfig } from 'vite'

// Set the base path for GitHub Pages. If deploying to
// https://<user>.github.io/<repo>/ you need base = '/<repo>/'
// For local dev, Vite ignores base. You can override with VITE_BASE env.
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
})
