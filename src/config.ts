/**
 * Site-wide content. Everything personal lives here — edit this file first.
 * Images are discovered automatically from src/assets/art/<collection>/.
 */

export type CollectionMeta = {
  /** Folder name inside src/assets/art */
  slug: string;
  name: string;
  /** One-line description shown on cards and collection pages */
  blurb?: string;
  /** Longer note shown at the top of a collection */
  description?: string;
  /** Filename slug of the image to use as the cover, e.g. "still-morning-2024" */
  coverSlug?: string;
};

export const site = {
  name: 'Kamda Kachroo',
  role: 'Painter & artist',
  tagline: 'Paintings, works on paper, and the slow work of looking.',
  description:
    'The personal archive of Kamda Kachroo — paintings, works on paper, and occasional notes from the studio.',
  email: 'hello@kamdakachroo.com',
  instagram: {
    handle: '@kamdakachroo',
    url: 'https://instagram.com/kamdakachroo',
  },
  location: 'India',
  /** "collection-slug/filename-slug" — shown large on the homepage */
  featured: 'paintings/still-morning-2024',
  statement:
    'I work slowly, mostly in the space between one season and the next. These paintings begin as observations — a table edge, the last of the afternoon on a wall — and end somewhere less certain. I am interested in what a colour remembers, and in leaving enough of the paper visible that the image feels found rather than made.',
  collections: [
    {
      slug: 'paintings',
      name: 'Paintings',
      blurb: 'Oil and acrylic on canvas — slow, layered surfaces built from observation and memory.',
      description:
        'Surfaces built up and sanded back over months. Most of these begin outdoors and are finished indoors, away from the thing itself.',
      coverSlug: 'still-morning-2024',
    },
    {
      slug: 'works-on-paper',
      name: 'Works on Paper',
      blurb: 'Gouache, ink, and soft pastel. Small, immediate pieces made close to the window.',
      description:
        'The quickest things I make. Paper keeps me honest — there is very little room to hide, so decisions arrive faster.',
      coverSlug: 'fern-notes-2025',
    },
    {
      slug: 'studies',
      name: 'Studies',
      blurb: 'Unfinished thinking. Fragments, colour tests, and things kept because they were almost right.',
      description:
        'Not sketches exactly. More like questions asked in paint, kept because the answer is still interesting.',
      coverSlug: 'ochre-study-2021',
    },
  ] satisfies CollectionMeta[],
} as const;

export const nav = [
  { label: 'Work', href: '/work' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/about' },
];
