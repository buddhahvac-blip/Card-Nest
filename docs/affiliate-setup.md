# CardNest affiliate program setup

Status: **integration infrastructure ready; partner acceptance pending**

## Official programs prepared

CardNest now has dormant integration slots for:

- TCGplayer Affiliate Program (Impact)
- eBay Partner Network
- Amazon Associates
- Target Partners (Impact)
- Walmart Affiliate Program (Impact)
- Fanatics Affiliate Program (Impact)
- Vault X Affiliate Program
- PSA Affiliate Partnerships

The founder-only **Affiliate Setup** page inside Nest Mind contains the official application entry points and timing notes.

## Activation rule

Applying does not activate a partner. A partner becomes public only after:

1. the partner/network accepts CardNest,
2. the founder obtains the exact public tracking/product link,
3. the link is reviewed for the correct destination and terms,
4. the matching approval flag is enabled in protected deployment settings.

Do not store passwords, tax information, bank details, Impact credentials, Amazon credentials, eBay credentials, or private partner keys in GitHub.

## Public integration behavior

Approved partner links:

- display near a clear affiliate disclosure,
- open the destination partner directly,
- use `rel="sponsored noopener noreferrer"`,
- are labeled as paid links,
- keep CardNest originals visibly separate from third-party products,
- record only an aggregate CardNest partner/category click event,
- do not place third-party affiliate purchases inside CardNest's Stripe checkout.

Amazon is special: when Amazon links are active, the site automatically displays the required statement:

> As an Amazon Associate I earn from qualifying purchases.

## Product catalogs

A partner's products/images/prices should be shown on CardNest only when the partner supplies or licenses that content through an approved API, feed, creative library, or other permitted method. Do not scrape a retailer's site.

When a feed/API becomes available, build native CardNest product cards while keeping the outbound purchase button tied to the exact qualifying affiliate link.

## Environment slots

See `.env.example`. All approval flags default to `false`.

## Monthly review

Review partner links, required disclosures, APIs/feeds, broken destinations, commission terms, and network-reported conversions at least monthly.
