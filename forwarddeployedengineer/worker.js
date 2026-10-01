/* Cloudflare Worker for fde.callremind.my + forwarddeployedengineer.my
   (mirrors cemas/app/src/worker.js pattern).
   Serves the Next.js static export from dist/ assets:
     - Pretty URLs: /jobs → /jobs.html, /vs/x → /vs/x.html
     - SPA fallback: unknown routes → / (lets client nav handle it)
     - Link headers on HTML pages so agents/crawlers find key hubs. */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname

    let resp = await env.ASSETS.fetch(request)

    /* Pretty-URL fallback: extensionless path → sibling .html file. */
    if (resp.status === 404 && !path.includes('.')) {
      const htmlPath = path.replace(/\/$/, '') + '.html'
      resp = await env.ASSETS.fetch(new URL(htmlPath, url.origin))
    }

    /* SPA fallback: still 404 → home (client-side nav takes over). */
    if (resp.status === 404) {
      resp = await env.ASSETS.fetch(new URL('/', url.origin))
    }

    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('text/html')) {
      const out = new Response(resp.body, resp)
      out.headers.append('Link', '</jobs>; rel="collection"; title="FDE jobs"')
      out.headers.append('Link', '</salaries/palantir>; rel="alternate"; title="FDE salaries"')
      out.headers.append('Link', '</interview/palantir>; rel="alternate"; title="FDE interview guide"')
      return out
    }

    return resp
  },
}
