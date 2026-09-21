// Tiny fetch wrapper — all API routes are same-origin Next.js routes (/api/*).
const BASE = '/api';

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`GET ${path} ${r.status}`);
  return r.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
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
