import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simula a serverless function da Vercel em dev, sem precisar do `vercel dev`.
function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/creatives', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/creatives.js')
        res.status = (code) => { res.statusCode = code; return res }
        res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }
        await handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
})
