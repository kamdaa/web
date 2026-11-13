/**
 * Generates placeholder artwork so the site looks complete before real photos arrive.
 * Run with: npm run art
 *
 * Drop your own images into src/assets/art/<collection>/ and delete the SVGs you
 * don't want. Filenames become titles and years automatically.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const palettes = [
  { bg: ['#f9f2e6', '#efe2ce'], clay: '#d69a72', sage: '#8c9c74', tan: '#e7d2b5', ink: '#5c6c4a' },
  { bg: ['#f6ecdd', '#eaddc8'], clay: '#ce8f66', sage: '#7f9167', tan: '#e5cdaf', ink: '#66744f' },
  { bg: ['#f0ecdc', '#e2e2cb'], clay: '#d79b73', sage: '#87996f', tan: '#dcc8a8', ink: '#566647' },
  { bg: ['#f7ecdf', '#ebdbc6'], clay: '#c98459', sage: '#8c9c74', tan: '#e5ceb2', ink: '#4f5f42' },
  { bg: ['#faf4e9', '#f1e7d7'], clay: '#cf9862', sage: '#94a47c', tan: '#e6d1b3', ink: '#6a5a45' },
  { bg: ['#f3efe2', '#e6e4d2'], clay: '#cf9369', sage: '#7d8f66', tan: '#e0cbaa', ink: '#556445' },
];

const grain = `
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>`;

function defs(p) {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${p.bg[0]}"/>
      <stop offset="1" stop-color="${p.bg[1]}"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="52"/>
    </filter>
    <filter id="soft-sm" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>${grain}
  </defs>`;
}

function horizon(w, h, p, r) {
  const hy = h * (0.58 + r() * 0.08);
  return `
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g filter="url(#soft)" opacity="0.9">
    <ellipse cx="${w * 0.5}" cy="${h * 0.72}" rx="${w * 0.52}" ry="${h * 0.22}" fill="${p.clay}" opacity="0.62"/>
    <ellipse cx="${w * 0.24}" cy="${h * 0.38}" rx="${w * 0.3}" ry="${h * 0.2}" fill="${p.sage}" opacity="0.5"/>
  </g>
  <line x1="${w * 0.09}" y1="${hy}" x2="${w * 0.91}" y2="${hy}" stroke="${p.ink}" stroke-width="1.4" opacity="0.5"/>
  <circle cx="${w * 0.7}" cy="${h * 0.33}" r="${Math.min(w, h) * 0.085}" fill="${p.clay}" opacity="0.9"/>
  <path d="M ${w * 0.14} ${h * 0.24} Q ${w * 0.3} ${h * 0.06} ${w * 0.44} ${h * 0.27}" fill="none" stroke="${p.ink}" stroke-width="1.2" opacity="0.32"/>
  <rect x="${w * 0.09}" y="${h * 0.84}" width="${w * 0.16}" height="${h * 0.006}" fill="${p.ink}" opacity="0.3"/>`;
}

function fields(w, h, p, r) {
  const cx = w * (0.36 + r() * 0.18);
  return `
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g filter="url(#soft)">
    <ellipse cx="${cx}" cy="${h * 0.42}" rx="${w * 0.34}" ry="${h * 0.28}" fill="${p.sage}" opacity="0.64"/>
    <ellipse cx="${w * 0.7}" cy="${h * 0.68}" rx="${w * 0.3}" ry="${h * 0.24}" fill="${p.clay}" opacity="0.6"/>
  </g>
  <g filter="url(#soft-sm)">
    <rect x="${w * 0.2}" y="${h * 0.6}" width="${w * 0.4}" height="${h * 0.16}" fill="${p.tan}" opacity="0.75"/>
  </g>
  <line x1="${w * 0.28}" y1="${h * 0.1}" x2="${w * 0.28}" y2="${h * 0.9}" stroke="${p.ink}" stroke-width="1.1" opacity="0.4"/>
  <circle cx="${w * 0.72}" cy="${h * 0.26}" r="${Math.min(w, h) * 0.035}" fill="${p.ink}" opacity="0.65"/>
  <line x1="${w * 0.12}" y1="${h * 0.86}" x2="${w * 0.88}" y2="${h * 0.86}" stroke="${p.ink}" stroke-width="1" opacity="0.28"/>`;
}

function arch(w, h, p, r) {
  const left = w * 0.24;
  const right = w * 0.76;
  const top = h * 0.34;
  const spring = top + (right - left) / 2;
  const bottom = h * 0.82;
  return `
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="${p.tan}" opacity="0.4"/>
  <path d="M ${left} ${bottom}
           L ${left} ${spring}
           A ${(right - left) / 2} ${(right - left) / 2} 0 0 1 ${right} ${spring}
           L ${right} ${bottom} Z"
        fill="${p.sage}" opacity="0.68" filter="url(#soft-sm)"/>
  <path d="M ${left} ${bottom}
           L ${left} ${spring}
           A ${(right - left) / 2} ${(right - left) / 2} 0 0 1 ${right} ${spring}
           L ${right} ${bottom}"
        fill="none" stroke="${p.ink}" stroke-width="1.5" opacity="0.45"/>
  <circle cx="${w * 0.7}" cy="${h * 0.5}" r="${Math.min(w, h) * 0.068}" fill="${p.clay}" opacity="0.9"/>
  <line x1="${w * 0.1}" y1="${h * 0.9}" x2="${w * 0.9}" y2="${h * 0.9}" stroke="${p.ink}" stroke-width="1.2" opacity="0.35"/>
  <rect x="${w * 0.13}" y="${h * 0.13}" width="${w * 0.09}" height="${w * 0.09}" fill="${p.clay}" opacity="0.35"/>`;
}

function windowShape(w, h, p, r) {
  const x = w * 0.2;
  const y = h * 0.18;
  const ww = w * 0.52;
  const wh = h * 0.44;
  return `
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g filter="url(#soft)">
    <ellipse cx="${w * 0.62}" cy="${h * 0.56}" rx="${w * 0.3}" ry="${h * 0.2}" fill="${p.clay}" opacity="0.5"/>
  </g>
  <rect x="${x}" y="${y}" width="${ww}" height="${wh}" fill="${p.sage}" opacity="0.4" filter="url(#soft-sm)"/>
  <rect x="${x}" y="${y}" width="${ww}" height="${wh}" fill="none" stroke="${p.ink}" stroke-width="1.6" opacity="0.5"/>
  <line x1="${x}" y1="${y + wh / 2}" x2="${x + ww}" y2="${y + wh / 2}" stroke="${p.ink}" stroke-width="1" opacity="0.35"/>
  <line x1="${x + ww / 2}" y1="${y}" x2="${x + ww / 2}" y2="${y + wh}" stroke="${p.ink}" stroke-width="1" opacity="0.25"/>
  <circle cx="${w * 0.76}" cy="${h * 0.76}" r="${Math.min(w, h) * 0.09}" fill="${p.clay}" opacity="0.55"/>
  <path d="M ${w * 0.12} ${h * 0.82} L ${w * 0.34} ${h * 0.72}" stroke="${p.ink}" stroke-width="1.2" opacity="0.3"/>`;
}

const variants = [horizon, fields, arch, windowShape];

const works = [
  // Paintings
  { collection: 'paintings', slug: 'still-morning-2024', w: 1200, h: 1600, variant: 0, palette: 0, seed: 11 },
  { collection: 'paintings', slug: 'dusk-study-2023', w: 1600, h: 1200, variant: 1, palette: 2, seed: 23 },
  { collection: 'paintings', slug: 'the-long-field-2025', w: 1800, h: 1000, variant: 0, palette: 1, seed: 37 },
  { collection: 'paintings', slug: 'clay-and-light-2022', w: 1200, h: 1600, variant: 2, palette: 3, seed: 41 },
  { collection: 'paintings', slug: 'quiet-house-2024', w: 1400, h: 1400, variant: 3, palette: 0, seed: 53 },
  { collection: 'paintings', slug: 'low-sun-2023', w: 1200, h: 1600, variant: 1, palette: 1, seed: 67 },
  // Works on paper
  { collection: 'works-on-paper', slug: 'fern-notes-2025', w: 1500, h: 1100, variant: 1, palette: 4, seed: 71 },
  { collection: 'works-on-paper', slug: 'after-rain-2023', w: 1200, h: 1500, variant: 2, palette: 2, seed: 83 },
  { collection: 'works-on-paper', slug: 'small-hours-2022', w: 1200, h: 1200, variant: 3, palette: 4, seed: 97 },
  { collection: 'works-on-paper', slug: 'blue-window-2024', w: 1500, h: 1100, variant: 3, palette: 5, seed: 101 },
  // Studies
  { collection: 'studies', slug: 'ochre-study-2021', w: 1200, h: 1400, variant: 0, palette: 4, seed: 113 },
  { collection: 'studies', slug: 'margins-2025', w: 1300, h: 1000, variant: 3, palette: 4, seed: 127 },
];

for (const work of works) {
  const palette = palettes[work.palette];
  const random = rng(work.seed);
  const body = variants[work.variant](work.w, work.h, palette, random);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${work.w}" height="${work.h}" viewBox="0 0 ${work.w} ${work.h}" role="img">
${defs(palette)}${body}
  <rect width="${work.w}" height="${work.h}" filter="url(#grain)" opacity="0.06" style="mix-blend-mode:multiply"/>
</svg>
`;

  const target = join(root, 'src', 'assets', 'art', work.collection, `${work.slug}.svg`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg, 'utf8');
  console.log(`created ${work.collection}/${work.slug}.svg`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#f2ebdc"/>
  <circle cx="26" cy="30" r="17" fill="#8c9c74" opacity="0.9"/>
  <path d="M26 47a17 17 0 0 0 17-17" fill="none" stroke="#d69a72" stroke-width="4" stroke-linecap="round"/>
  <circle cx="45" cy="45" r="4" fill="#d69a72"/>
</svg>
`;
await writeFile(join(root, 'public', 'favicon.svg'), favicon, 'utf8');
console.log('created public/favicon.svg');
