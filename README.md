# Kamda Kachroo — personal art site

A quiet, warm pastel portfolio built with [Astro](https://astro.build) and Tailwind CSS.
Beige paper, pastel green, and soft orange; Fraunces for display type and Instrument Sans
for everything else.

## See your site (no technical steps)

**Live site:** https://kamdaa.github.io/web/

Double-click **`Open Live Site.url`** to visit it, or **`View Site.cmd`** to preview it on your own computer.

Your browser opens the site. A small black server window also opens, minimised — keep it
open while you browse, and close it when you are finished. Nothing is sent anywhere; it
runs only on this computer for now.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Astro prints (usually `http://localhost:4321`).

```bash
npm run build     # static site in dist/
npm run preview   # preview the built site
```

Node 22.23+ is required.

## Add your artwork

Drop images into a collection folder:

```
src/assets/art/paintings/dusk-study-2024.jpg
src/assets/art/works-on-paper/fern-notes-2025.jpg
```

- **The folder becomes the collection.** Add a new folder and it appears automatically.
- **The filename becomes the title and year.** `dusk-study-2024.jpg` → *Dusk Study*, 2024.
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.svg`.
- The first artwork in a collection (newest first) becomes its cover unless you set
  `coverSlug` in `src/config.ts`.
- Restart the dev server after adding files so the asset list refreshes.

The site sorts works by year, newest first, then alphabetically. Photos are automatically
served as responsive WebP at several widths; SVGs pass through untouched.

The twelve abstract SVGs currently in `src/assets/art/` are placeholders. Delete them as
your real work arrives, or keep a few. `npm run art` regenerates the placeholders.

## Edit the words

Almost everything personal lives in **`src/config.ts`**:

- name, tagline, description
- email and Instagram
- location and artist statement
- collection names, blurbs, and cover images
- the featured work on the homepage (`collection/filename`)

The About page text and portrait are in **`src/pages/about.astro`**. The portrait is
`src/assets/about/frida.svg` — an original abstract homage, not a photograph. Replace it
with your own studio portrait by pointing the import at a new image.

## Write a journal entry

Add a Markdown file to `src/content/journal/`:

```md
---
title: 'A new note'
date: 2026-11-13
excerpt: 'One sentence that appears on the journal index.'
draft: false
---

Your writing here. Markdown, headings, quotes, and lists all work.
```

The filename becomes the URL: `a-new-note.md` → `/journal/a-new-note/`.
Set `draft: true` to keep an entry out of the site.

## Change the palette or type

Design tokens live at the top of **`src/styles/global.css`**:

```css
--color-paper: #f4e9d8;
--color-ink: #332a21;
--color-sage: #8c9c74;
--color-clay: #d69a72;
```

Changing these updates buttons, links, captions, and the lightbox together.
Fonts are self-hosted through Fontsource, so no external requests are made.

## Structure

```
src/
  config.ts              site identity and collections
  lib/art.ts             reads the art folders, builds titles and years
  layouts/Base.astro     head, nav, footer, page transitions
  components/            ArtGrid, ArtCard, ArtImage, Nav, Footer
  pages/                 home, work, collections, journal, about, 404
  content/journal/       Markdown journal entries
  assets/art/            your artwork, one folder per collection
  assets/about/          the portrait
  styles/global.css      palette, typography, prose, motion
scripts/make-art.mjs     placeholder artwork generator
```

The gallery uses a small measured masonry script so images keep their order and their
proportions. The lightbox is a native `<dialog>` — arrow keys, Escape, swipe, and focus
return all work without a dependency.

## Deploying

The site is published from the `main` branch with GitHub Actions. Every push rebuilds and
deploys automatically to **https://kamdaa.github.io/web/**. The workflow lives in
`.github/workflows/deploy.yml`; the output in `dist/` is still fully static if you ever want
to host it elsewhere.
