import type { ImageMetadata } from 'astro';
import { site, type CollectionMeta } from '../config';

/**
 * Every image in src/assets/art/<collection>/ is picked up automatically.
 * Filenames become titles and years:
 *   dusk-study-2024.jpg  ->  "Dusk Study", 2024, collection "paintings"
 * Drop a file in, restart the dev server, and it appears.
 */
const modules = import.meta.glob<ImageMetadata>('../assets/art/**/*.{jpg,jpeg,png,webp,avif,svg}', {
  eager: true,
  import: 'default',
});

const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into',
  'of', 'on', 'or', 'the', 'to', 'with',
]);

export type Artwork = {
  /** collection/filename, useful as a stable key */
  id: string;
  /** filename without extension */
  slug: string;
  title: string;
  year: number | null;
  collection: string;
  collectionName: string;
  image: ImageMetadata;
  alt: string;
};

export type Collection = CollectionMeta & {
  artworks: Artwork[];
  count: number;
  cover: Artwork | undefined;
};

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function collectionName(slug: string): string {
  return titleCase(slug);
}

const parsed = Object.entries(modules).flatMap(([path, image]) => {
  const match = path.match(/art\/([^/]+)\/([^/]+)$/);
  if (!match) return [];

  const [, collection, file] = match;
  const filename = file.replace(/\.[^.]+$/, '');
  const yearMatch = filename.match(/(?:^|[-_\s])((?:19|20)\d{2})$/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const base = yearMatch ? filename.slice(0, yearMatch.index) : filename;
  const title = titleCase(base.replace(/[-_\s]+$/, ''));

  const artwork: Artwork = {
    id: `${collection}/${filename}`,
    slug: filename,
    title,
    year,
    collection,
    collectionName: collectionName(collection),
    image,
    alt: `${title}${year ? `, ${year}` : ''} — ${collectionName(collection).toLowerCase()}`,
  };

  return [artwork];
});

function sortArtworks(artworks: Artwork[]): Artwork[] {
  return [...artworks].sort((a, b) => {
    if (a.year !== b.year) {
      if (a.year === null) return 1;
      if (b.year === null) return -1;
      return b.year - a.year;
    }
    return a.title.localeCompare(b.title);
  });
}

export function getAllArtworks(): Artwork[] {
  return sortArtworks(parsed);
}

export function getCollections(): Collection[] {
  const grouped = new Map<string, Artwork[]>();
  for (const artwork of parsed) {
    const list = grouped.get(artwork.collection) ?? [];
    list.push(artwork);
    grouped.set(artwork.collection, list);
  }

  const defined = new Map(site.collections.map((collection) => [collection.slug, collection]));
  const definedSlugs = site.collections
    .map((collection) => collection.slug)
    .filter((slug) => grouped.has(slug));
  const extraSlugs = [...grouped.keys()]
    .filter((slug) => !defined.has(slug))
    .sort((a, b) => a.localeCompare(b));

  return [...definedSlugs, ...extraSlugs].map((slug) => {
    const meta: CollectionMeta = defined.get(slug) ?? {
      slug,
      name: collectionName(slug),
    };
    const artworks = sortArtworks(grouped.get(slug) ?? []);
    const cover =
      artworks.find((artwork) => artwork.slug === meta.coverSlug) ?? artworks[0] ?? undefined;

    return {
      ...meta,
      artworks,
      count: artworks.length,
      cover,
    };
  });
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return getCollections().find((collection) => collection.slug === slug);
}

export function getRecentArtworks(limit = 6): Artwork[] {
  const all = getAllArtworks();
  const newest = [...all].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const seen = new Set<string>();
  const picked: Artwork[] = [];

  // Prefer variety across collections before repeating one.
  for (const artwork of newest) {
    if (seen.has(artwork.collection)) continue;
    seen.add(artwork.collection);
    picked.push(artwork);
    if (picked.length === limit) return picked;
  }
  for (const artwork of all) {
    if (picked.includes(artwork)) continue;
    picked.push(artwork);
    if (picked.length === limit) break;
  }
  return picked;
}

export function getFeaturedArtwork(): Artwork | undefined {
  const all = getAllArtworks();
  return all.find((artwork) => artwork.id === site.featured) ?? all[0];
}
