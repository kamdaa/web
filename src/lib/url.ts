/**
 * Prefixes internal links with Astro's base path.
 * Dev runs at "/", GitHub Pages at "/web/".
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path = '/'): string {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalised}`;
}
