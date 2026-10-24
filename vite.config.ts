import { defineConfig, loadEnv, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

/** Public pages, listed in the sitemap. The rest of the app is per-user data. */
const PUBLIC_ROUTES = ['/', '/biblioteca', '/historico']

/**
 * Fills `%SITE_URL%` in index.html and emits robots.txt and sitemap.xml with
 * absolute URLs, which the SEO tags require. Set VITE_SITE_URL at build time.
 */
function siteMeta(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, '')
  return {
    name: 'site-meta',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', base),
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const urls = PUBLIC_ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${base}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
      ).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /sessao/\n\nSitemap: ${base}/sitemap.xml\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl =
    process.env.VITE_SITE_URL ?? env.VITE_SITE_URL ?? 'https://fitlog.example.com'

  return {
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      siteMeta(siteUrl),
    ],
  }
})
