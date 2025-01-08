import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import { oidcAuthMiddleware, revokeSession } from "@hono/oidc-auth";

const app = new Hono()

// Error handling middleware
app.onError((err, c) => {
  console.error(err)
  return c.text('Internal Server Error', 500)
})

app.get('/logout', async (c) => {
  await revokeSession(c)
  return c.text('You have been successfully logged out!')
})

// Require OIDC Authentication for '*'
app.use('*', oidcAuthMiddleware())


// Reverse Proxy
app.all('*', async (c) => {
  try {
    const url = new URL(c.req.url)
    const proxy_url = resolveProxyUrl(c, url)
    const response = await fetch(proxy_url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
      redirect: 'manual',
    })

    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    })
  } catch (e) {
    if (e instanceof HTTPException) {
      throw e
    } else {
      throw new HTTPException(500, { message: `cf-oidc-proxy: ${e}` })
    }
  }
})

const resolveProxyUrl = (c: Context, url: URL): URL => {
  const { PROXY_PASS } = env<{PROXY_PASS: object}>(c)
  let proxy_url
  if (Object.hasOwn(PROXY_PASS, url.hostname)) {
    proxy_url = new URL(PROXY_PASS[url.hostname])
  } else if (Object.hasOwn(PROXY_PASS, '*')) {
    proxy_url = new URL(PROXY_PASS['*'])
  } else {
    throw new HTTPException(500, { message: `cf-oidc-proxy: Undefined environment variable PROXY_PASS["${url.hostname}"]` })
  }
  proxy_url.pathname = url.pathname
  proxy_url.search = url.search
  return proxy_url
}

export default app
