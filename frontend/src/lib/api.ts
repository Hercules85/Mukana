// Tiny fetch wrapper. In the browser we hit the same origin and rely on the
// Next.js rewrite /api/backend/* -> backend. On the server we call the backend directly.
const PREFIX = (() => {
  if (typeof window !== 'undefined') return '/api/backend';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
})();

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${PREFIX}/api${path}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${PREFIX}/api${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`POST ${path} ${r.status}: ${text}`);
  }
  return r.json();
}

/** Strip the size suffix so we can request different sizes on demand. */
export function driveUrl(id: string, size: 400 | 800 | 1200 | 2000 = 1200) {
  return `https://lh3.googleusercontent.com/d/${id}=w${size}`;
}
