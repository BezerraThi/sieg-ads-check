import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Simula as serverless/edge functions da Vercel em dev, sem precisar do `vercel dev`.
function apiDevMiddleware() {
  async function readBody(req) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    return Buffer.concat(chunks)
  }

  function nodeHandler(server, modulePath) {
    return async (req, res) => {
      const { default: handler } = await server.ssrLoadModule(modulePath)
      res.status = (code) => { res.statusCode = code; return res }
      res.json = (body) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)) }
      if (req.method === 'POST') {
        const raw = (await readBody(req)).toString('utf-8')
        try { req.body = raw ? JSON.parse(raw) : {} } catch { req.body = {} }
      }
      await handler(req, res)
    }
  }

  function edgeHandler(server, modulePath) {
    return async (req, res) => {
      const mod = await server.ssrLoadModule(modulePath)
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        if (value != null) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
      const webReq = new Request(`http://localhost${req.url}`, {
        method: req.method,
        headers,
        body: hasBody ? await readBody(req) : undefined,
      })
      const webRes = await mod.default(webReq)
      res.statusCode = webRes.status
      webRes.headers.forEach((value, key) => res.setHeader(key, value))
      if (!webRes.body) { res.end(); return }
      const reader = webRes.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(Buffer.from(value))
      }
      res.end()
    }
  }

  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (url.startsWith('/api/creatives')) return nodeHandler(server, '/api/creatives.js')(req, res)
        if (url.startsWith('/api/session')) return nodeHandler(server, '/api/session.js')(req, res)
        if (url.startsWith('/api/auth/google')) return nodeHandler(server, '/api/auth/google.js')(req, res)
        if (url.startsWith('/api/auth/logout')) return nodeHandler(server, '/api/auth/logout.js')(req, res)
        if (url.startsWith('/api/media/')) return edgeHandler(server, '/api/media/[id].js')(req, res)
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // As funcoes em api/ leem process.env diretamente (fora do bundle do Vite),
  // entao precisamos injetar o .env manualmente pro dev server.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), apiDevMiddleware()],
  }
})
