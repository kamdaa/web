/**
 * Generates placeholder artwork in a modern pastel style:
 * flat coral, teal, dusty blue, mustard and peach shapes, bold botanical line work.
 *
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

const C = {
  cream: '#f8eeda',
  creamDeep: '#f2e2c5',
  paper: '#fbf4e4',
  ink: '#2f2a25',
  coral: '#ef7f74',
  peach: '#f2b28c',
  teal: '#6f9f98',
  blue: '#93a9c2',
  mustard: '#e6b44b',
  green: '#93a77c',
  greenLight: '#c3cfa9',
};

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>`;

function leafPath(length, width) {
  return `M0,0 C ${length * 0.28},${-width} ${length * 0.76},${-width * 0.78} ${length},0 C ${length * 0.76},${width * 0.78} ${length * 0.28},${width} 0,0 Z`;
}

function stem(x, y, height, angle, { leaves = 4, colors = [C.green], r = Math.random } = {}) {
  const bend = height * (0.04 + r() * 0.06);
  let parts = `<path d="M0,0 C ${bend},${-height * 0.34} ${-bend * 0.6},${-height * 0.7} ${bend * 0.25},${-height}" fill="none" stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round"/>`;

  for (let i = 0; i < leaves; i += 1) {
    const t = 0.34 + (i * 0.63) / Math.max(1, leaves - 1);
    const side = i % 2 === 0 ? 1 : -1;
    const rotation = side * (23 + r() * 15) + (r() - 0.5) * 6;
    const length = height * (0.28 + r() * 0.07);
    const width = length * (0.33 + r() * 0.06);
    const fill = colors[i % colors.length];

    parts += `<g transform="translate(0,${-height * t}) rotate(${rotation})">
      <path d="${leafPath(length, width)}" fill="${fill}" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M0,0 L${length},0" stroke="${C.ink}" stroke-width="1.1" opacity="0.5"/>
    </g>`;
  }

  return `<g transform="translate(${x},${y}) rotate(${angle})">${parts}</g>`;
}

function sun(cx, cy, radius, rings = [C.coral, C.cream, C.coral, C.cream], outline = true) {
  let body = '';
  const scale = [1, 0.79, 0.54, 0.27];
  for (let i = 0; i < scale.length; i += 1) {
    body += `<circle cx="${cx}" cy="${cy}" r="${radius * scale[i]}" fill="${rings[i % rings.length]}"/>`;
  }
  if (outline) {
    body += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${C.ink}" stroke-width="2.2"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="${radius * 0.79}" fill="none" stroke="${C.ink}" stroke-width="1.5" opacity="0.7"/>`;
  }
  return body;
}

function dash(x, y, length, angle, color, width = 13) {
  return `<rect x="${-length / 2}" y="${-width / 2}" width="${length}" height="${width}" rx="${width / 2}" fill="${color}" transform="translate(${x},${y}) rotate(${angle})"/>`;
}

function confetti(cx, cy, radius, count, color, r = Math.random, spread = 1.3) {
  let body = '';
  for (let i = 0; i < count; i += 1) {
    const angle = (spread * Math.PI * 2 * i) / count + (r() - 0.5) * 0.35;
    const distance = radius * (0.8 + r() * 0.35);
    body += dash(
      cx + Math.cos(angle) * distance,
      cy + Math.sin(angle) * distance,
      20 + r() * 24,
      (angle * 180) / Math.PI + 90 + (r() - 0.5) * 25,
      color,
      10 + r() * 5,
    );
  }
  return body;
}

function wave(w, h, y, amplitude, fill, { outline = true, up = false } = {}) {
  const a = up ? -amplitude : amplitude;
  const path = `M0,${y} C ${w * 0.14},${y - a} ${w * 0.26},${y + a} ${w * 0.44},${y} C ${w * 0.62},${y - a} ${w * 0.78},${y + a} ${w},${y} L ${w},${h} L 0,${h} Z`;
  const line = `M0,${y} C ${w * 0.14},${y - a} ${w * 0.26},${y + a} ${w * 0.44},${y} C ${w * 0.62},${y - a} ${w * 0.78},${y + a} ${w},${y}`;
  return `<path d="${path}" fill="${fill}"/>${outline ? `<path d="${line}" fill="none" stroke="${C.ink}" stroke-width="2" opacity="0.6"/>` : ''}`;
}

function arch(cx, base, width, height, fill, stroke = true) {
  const r = width / 2;
  const top = base - height;
  return `<path d="M ${cx - r} ${base} L ${cx - r} ${top + r} A ${r} ${r} 0 0 1 ${cx + r} ${top + r} L ${cx + r} ${base} Z" fill="${fill}" ${stroke ? `stroke="${C.ink}" stroke-width="2"` : ''}/>`;
}

function dots(cx, cy, count, spread, color, r = Math.random) {
  let body = '';
  for (let i = 0; i < count; i += 1) {
    const angle = r() * Math.PI * 2;
    const distance = spread * (0.4 + r() * 1.3);
    body += `<circle cx="${cx + Math.cos(angle) * distance}" cy="${cy + Math.sin(angle) * distance}" r="${3 + r() * 7}" fill="${color}"/>`;
  }
  return body;
}

/* ---- compositions ---- */

function sunrise(w, h, r, bg) {
  const s = Math.min(w, h);
  const cx = w * 0.8;
  const cy = h * 0.24;

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += wave(w, h, h * 0.88, h * 0.03, C.teal);
  body += sun(cx, cy, s * 0.4);
  body += confetti(cx - s * 0.4, cy + s * 0.12, s * 0.14, 6, C.peach, r, 0.9);
  body += stem(w * 0.18, h * 0.92, h * 0.52, -7, { leaves: 4, colors: [C.green, bg, C.greenLight], r });
  body += stem(w * 0.34, h * 1.0, h * 0.64, 5, { leaves: 3, colors: [bg, C.green, C.greenLight], r });
  body += dots(w * 0.58, h * 0.64, 4, s * 0.04, C.mustard, r);
  return body;
}

function tide(w, h, r, bg) {
  const s = Math.min(w, h);

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += wave(w, h * 0.2, 0, h * 0.05, C.blue, { up: true });
  body += `<circle cx="${w * 0.24}" cy="${h * 0.35}" r="${s * 0.11}" fill="${C.mustard}"/>`;
  body += `<circle cx="${w * 0.24}" cy="${h * 0.35}" r="${s * 0.15}" fill="none" stroke="${C.ink}" stroke-width="1.8" opacity="0.55"/>`;
  body += stem(w * 0.54, h * 1.02, h * 0.6, -4, { leaves: 4, colors: [C.greenLight, bg, C.green], r });
  body += stem(w * 0.76, h * 1.0, h * 0.44, 8, { leaves: 3, colors: [bg, C.greenLight], r });
  body += wave(w, h, h * 0.76, h * 0.055, C.teal);
  body += `<circle cx="${w * 0.84}" cy="${h * 0.14}" r="${s * 0.05}" fill="${C.coral}"/>`;
  body += confetti(w * 0.12, h * 0.62, s * 0.055, 4, C.peach, r, 1);
  return body;
}

function arches(w, h, r, bg) {
  const s = Math.min(w, h);
  const base = h * 0.84;
  const cx = w * 0.32;

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += `<rect x="0" y="${h * 0.84}" width="${w}" height="${h * 0.16}" fill="${C.creamDeep}"/>`;
  body += `<circle cx="0" cy="0" r="${s * 0.34}" fill="${C.blue}" opacity="0.7"/>`;
  body += arch(cx, base, s * 0.54, h * 0.6, C.teal);
  body += arch(cx, base, s * 0.38, h * 0.46, C.cream);
  body += arch(cx, base, s * 0.21, h * 0.32, C.coral);
  body += sun(w * 0.8, h * 0.2, s * 0.11, [C.mustard, C.cream, C.mustard, C.cream]);
  body += stem(w * 0.79, h * 1.03, h * 0.4, 7, { leaves: 3, colors: [C.green, bg, C.greenLight], r });
  body += stem(w * 0.93, h * 1.02, h * 0.3, -9, { leaves: 2, colors: [bg, C.greenLight], r });
  body += confetti(w * 0.14, h * 0.18, s * 0.05, 4, C.peach, r, 1);
  body += `<line x1="${w * 0.06}" y1="${h * 0.92}" x2="${w * 0.94}" y2="${h * 0.92}" stroke="${C.ink}" stroke-width="1.5" opacity="0.3"/>`;
  return body;
}

function bloom(w, h, r, bg) {
  const s = Math.min(w, h);
  const cx = w * 0.72;
  const cy = h * 0.38;
  const radius = s * 0.3;

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${C.coral}"/>`;
  body += `<circle cx="${cx - radius * 0.2}" cy="${cy - radius * 0.12}" r="${radius * 0.44}" fill="${C.cream}"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  body += stem(w * 0.3, h * 1.04, h * 0.68, -6, { leaves: 4, colors: [C.green, bg, C.green], r });
  body += stem(w * 0.5, h * 1.02, h * 0.5, 5, { leaves: 3, colors: [C.greenLight, bg], r });
  body += `<circle cx="${w * 0.18}" cy="${h * 0.3}" r="${s * 0.08}" fill="none" stroke="${C.mustard}" stroke-width="${s * 0.026}"/>`;
  body += dots(w * 0.84, h * 0.12, 3, s * 0.035, C.peach, r);
  body += dash(w * 0.12, h * 0.64, s * 0.06, 40, C.peach);
  return body;
}

function meadow(w, h, r, bg) {
  const s = Math.min(w, h);

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += sun(w * 0.14, h * 0.16, s * 0.08, [C.mustard, C.cream, C.mustard, C.cream]);
  body += `<circle cx="${w * 0.78}" cy="${h * 0.12}" r="${s * 0.042}" fill="${C.coral}"/>`;
  body += stem(w * 0.2, h * 1.02, h * 0.62, -5, { leaves: 4, colors: [C.green, bg, C.greenLight], r });
  body += stem(w * 0.42, h * 0.98, h * 0.82, 3, { leaves: 5, colors: [bg, C.green, C.greenLight], r });
  body += stem(w * 0.68, h * 1.04, h * 0.68, -2, { leaves: 4, colors: [C.greenLight, bg], r });
  body += wave(w, h, h * 0.81, h * 0.04, C.teal);
  body += wave(w, h, h * 0.92, h * 0.02, C.blue, { outline: false });
  body += dots(w * 0.87, h * 0.52, 4, s * 0.04, C.coral, r);
  return body;
}

function orbit(w, h, r, bg) {
  const s = Math.min(w, h);
  const cx = w * 0.74;
  const cy = h * 0.22;
  const radius = s * 0.44;

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += `<path d="M ${w * 0.04} ${h * 0.14} C ${w * 0.08} ${h * 0.02} ${w * 0.28} ${h * 0.0} ${w * 0.44} ${h * 0.06} L ${w * 0.44} ${h * 0.19} C ${w * 0.3} ${h * 0.13} ${w * 0.12} ${h * 0.16} ${w * 0.04} ${h * 0.27} Z" fill="${C.blue}"/>`;
  body += sun(cx, cy, radius);
  body += stem(w * 0.2, h * 1.02, h * 0.64, 2, { leaves: 4, colors: [C.green, bg, C.green], r });
  body += `<circle cx="${w * 0.38}" cy="${h * 0.28}" r="${s * 0.055}" fill="${C.mustard}"/>`;
  body += dash(w * 0.6, h * 0.07, s * 0.05, 14, C.peach);
  body += dots(w * 0.1, h * 0.7, 3, s * 0.035, C.peach, r);
  body += wave(w, h, h * 0.9, h * 0.025, C.teal, { outline: false });
  return body;
}

function grove(w, h, r, bg) {
  const s = Math.min(w, h);

  let body = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  body += `<circle cx="${w * 0.78}" cy="${h * 0.2}" r="${s * 0.12}" fill="${C.peach}"/>`;
  body += `<circle cx="${w * 0.18}" cy="${h * 0.26}" r="${s * 0.07}" fill="none" stroke="${C.mustard}" stroke-width="${s * 0.022}"/>`;
  body += stem(w * 0.38, h * 1.05, h * 0.78, -3, { leaves: 5, colors: [C.green, bg, C.greenLight, C.green], r });
  body += stem(w * 0.62, h * 1.03, h * 0.6, 4, { leaves: 4, colors: [C.greenLight, bg, C.green], r });
  body += wave(w, h, h * 0.9, h * 0.025, C.teal, { outline: false });
  body += dots(w * 0.82, h * 0.62, 4, s * 0.04, C.coral, r);
  body += dash(w * 0.16, h * 0.52, s * 0.05, 65, C.peach);
  return body;
}

const variants = [sunrise, tide, arches, bloom, meadow, orbit, grove];
const backgrounds = [C.cream, C.paper, C.creamDeep, C.cream, C.paper, C.creamDeep];

const works = [
  // Paintings
  { collection: 'paintings', slug: 'still-morning-2024', w: 1200, h: 1600, variant: 0, bg: 0, seed: 11 },
  { collection: 'paintings', slug: 'dusk-study-2023', w: 1600, h: 1200, variant: 1, bg: 1, seed: 23 },
  { collection: 'paintings', slug: 'the-long-field-2025', w: 1800, h: 1000, variant: 4, bg: 2, seed: 37 },
  { collection: 'paintings', slug: 'clay-and-light-2022', w: 1200, h: 1600, variant: 3, bg: 3, seed: 41 },
  { collection: 'paintings', slug: 'quiet-house-2024', w: 1400, h: 1400, variant: 2, bg: 4, seed: 53 },
  { collection: 'paintings', slug: 'low-sun-2023', w: 1200, h: 1600, variant: 6, bg: 5, seed: 67 },
  // Works on paper
  { collection: 'works-on-paper', slug: 'fern-notes-2025', w: 1500, h: 1100, variant: 6, bg: 0, seed: 71 },
  { collection: 'works-on-paper', slug: 'after-rain-2023', w: 1200, h: 1500, variant: 4, bg: 2, seed: 83 },
  { collection: 'works-on-paper', slug: 'small-hours-2022', w: 1200, h: 1200, variant: 3, bg: 1, seed: 97 },
  { collection: 'works-on-paper', slug: 'blue-window-2024', w: 1500, h: 1100, variant: 5, bg: 3, seed: 101 },
  // Studies
  { collection: 'studies', slug: 'ochre-study-2021', w: 1200, h: 1400, variant: 2, bg: 5, seed: 113 },
  { collection: 'studies', slug: 'margins-2025', w: 1300, h: 1000, variant: 0, bg: 1, seed: 127 },
];

for (const work of works) {
  const random = rng(work.seed);
  const bg = backgrounds[work.bg];
  const body = variants[work.variant](work.w, work.h, random, bg);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${work.w}" height="${work.h}" viewBox="0 0 ${work.w} ${work.h}" role="img">
  <defs>${grain}</defs>
${body}
  <rect width="${work.w}" height="${work.h}" filter="url(#grain)" opacity="0.05" style="mix-blend-mode:multiply"/>
</svg>
`;

  const target = join(root, 'src', 'assets', 'art', work.collection, `${work.slug}.svg`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg, 'utf8');
  console.log(`created ${work.collection}/${work.slug}.svg`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#fbf2df"/>
  <circle cx="32" cy="32" r="21" fill="#ef7f74"/>
  <circle cx="32" cy="32" r="14" fill="#fbf2df"/>
  <circle cx="32" cy="32" r="7" fill="#ef7f74"/>
  <path d="M12 46c8-8 32-8 40 0" fill="none" stroke="#6f9f98" stroke-width="4" stroke-linecap="round"/>
</svg>
`;
await writeFile(join(root, 'public', 'favicon.svg'), favicon, 'utf8');
console.log('created public/favicon.svg');
