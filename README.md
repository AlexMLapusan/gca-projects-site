# GCA Projects — presentation website

Bilingual (English / Romanian) single-page presentation site for
**GCA Projects — gardening & design**, Bergen op Zoom (KVK 92187781).

## What's in here

```
site/
├── index.html        page structure (English text inline as fallback)
├── styles.css        design system — palette, type, layout
├── app.js            i18n engine, case-study modals, nav, reveals
├── i18n/
│   ├── en.json       English dictionary
│   └── ro.json       Romanian dictionary
├── assets/
│   ├── img/          33 curated portfolio photos (processed from originals)
│   └── fonts/        Archivo + Instrument Sans (woff2, latin + latin-ext)
└── serve-dev.js      tiny dev server: node serve-dev.js  →  http://localhost:4173
```

No build step, no dependencies, no backend. Any static host works.

## Deploying

1. **Register the domain** — as of 11 July 2026, both `gcaprojects.nl` and
   `gcaprojects.com` are unregistered (verified via SIDN/Verisign RDAP).
   The .nl is the one to grab for a Dutch customer base (~€10/yr at any
   registrar: TransIP, Versio, Mijndomein...).
2. **Upload this folder** to any static host — Netlify / Cloudflare Pages /
   GitHub Pages are free: drag-and-drop the `site/` folder or point the host
   at it. No configuration needed.
3. Done. The contact features are `tel:` / WhatsApp / `mailto:` links — no
   server required.

## Adding a language (e.g. Dutch)

1. Copy `i18n/en.json` → `i18n/nl.json` and translate the values
   (keys stay identical).
2. In `app.js` change `var LANGS = ["en", "ro"];` → `["en", "ro", "nl"]`.
3. Add a switcher button in `index.html` next to the EN/RO ones:
   `<button type="button" data-setlang="nl" aria-pressed="false">NL</button>`
   (both in the header and nothing else — the rest is automatic:
   detection, persistence, `<html lang>`, prefilled WhatsApp/mail text).

Dutch would be the obvious third language — the customer base is Dutch and
the Werkspot reviews are in Dutch.

## Notes

- **Address spelling:** the site uses the official municipal spelling
  "Piet Heinstraat 7" — the company letterhead spells it "Piet Heijnstraat".
  Both deliver, but pick one for consistency across Google Business etc.
- **Review quotes** in the Reviews section are translated from the company's
  real Werkspot reviews (4.7/5, 8 reviews) and link back to
  https://www.werkspot.nl/profiel/gca-projects — keep that link alive, it's
  the strongest trust signal the company has.
- **Photos**: processed (resized/compressed) from the WhatsApp originals.
  One photo set was deliberately left out because third-party branding is
  visible in the shots.
- A single-file version of this exact site (fonts + images inlined) is
  what got published as the live preview artifact.
