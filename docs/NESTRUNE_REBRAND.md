# NestRune artwork and public branding update

The approved 1672 × 941 composite is preserved unchanged in
`public/art/sources/nestrune-pack-hero.png`. The production hero is encoded
as WebP at quality 97, with Next/Image serving responsive versions at quality 95.
Its full aspect ratio is preserved, with a maximum displayed width of 1266px.

Four lossless WebP crops contain the original pixels without enlargement:

| Pack | Source rectangle (left, top, width, height) | Production file |
| --- | --- | --- |
| Hatchling | 160, 390, 328, 438 | public/art/packs/nestrune-hatchling-pack.webp |
| Nest | 504, 390, 318, 438 | public/art/packs/nestrune-nest-pack.webp |
| Guardian | 842, 390, 320, 438 | public/art/packs/nestrune-guardian-pack.webp |
| Royal Nest | 1174, 390, 328, 438 | public/art/packs/nestrune-royal-nest-pack.webp |

Individual crops display at up to 156 CSS pixels, retaining at least two source
pixels per CSS pixel. The hero and all four product cards use the approved
NestRune branding. Pack names, descriptions, availability and buttons remain HTML.
The previous layered banner, brand-cover spans and their unused styling are removed.

Split Card + Nest wordmarks are replaced on the homepage header/footer, Season
One, card/theme pages, showcase, albums, beta and feedback pages. Feedback
metadata, affiliate disclosure and Stripe administration prose are also updated.
The Founders card fan uses the existing GuardianCard presentation instead of
hardcoded legacy full-card JPEGs. OpenGraph and Twitter use the new composite.

## Compatibility and scope

No database migrations, Stripe configuration, authentication settings, release
flags, prices, drop weights or canon records are changed. The 21-card Founding
Flight pool and 369 canonical slots remain intact.

Internal names intentionally retained: `cardnest_v1` database schema; payment
and indexing environment variables; Stripe product metadata and order idempotency
keys; collector local storage and analytics migration keys; taxonomy paths;
legacy manifest normalization; health build identifier and upstream User-Agent.
These preserve compatibility, provenance and existing saved records.

The original full-card JPEGs and historical pack files are preserved. Some
legacy full-card JPEGs include a small CardNest imprint in their pixels. They
are no longer used for the Founders fan, but remain potential fallback/direct
archive assets. Altering those canonical originals is outside this pack-art
update; their replacement requires reviewed card derivatives, not a blanket
text replacement or an overlay that obscures the card.
