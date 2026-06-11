const HF_ORIGIN = 'https://huggingface.co';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag, Accept-Ranges, X-Linked-Size',
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  if (!headers.get('Content-Length') && headers.get('X-Linked-Size')) {
    headers.set('Content-Length', headers.get('X-Linked-Size'));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function proxyHuggingFace(request, url) {
  const hfPath = url.pathname.replace(/^\/hf\/?/, '/');
  const target = `${HF_ORIGIN}${hfPath}${url.search}`;

  const upstream = await fetch(target, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET',
    headers: {
      Accept: request.headers.get('Accept') || '*/*',
      'User-Agent': request.headers.get('User-Agent') || 'LocalEyes-HF-Proxy/1.0',
    },
    redirect: 'follow',
  });

  return withCors(upstream);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/hf')) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith('/hf/') || url.pathname === '/hf') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
      }
      return proxyHuggingFace(request, url);
    }

    return env.ASSETS.fetch(request);
  },
};
