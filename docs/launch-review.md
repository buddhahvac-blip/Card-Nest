# Season One art review update — 2026-09-28

The eleven approved clean full-card compositions are stored at `public/cards/season-01/001` through `011`, with identical full-card and avatar source files per number. Their native size is 320×427; these are review images, not high-resolution production masters. Original permanent database IDs are retained, while the displayed names, clans and draft stats now match those images. Existing saved copies of the first seven IDs will therefore display the new identities.

All eleven remain unreleased, uncollectible, and ineligible for pack drops. New saved free draws are paused; the 1, 3, 5 and 7 card reveal sequences are clearly marked animation demos. Existing ownership records are preserved. The old external OpenArt references and previous first-seven artwork are removed from active catalog paths. Checkout stays test-only gated; pack sales remain disabled. Human rights, provenance, text legibility, gameplay balance and full-resolution production art need review before a release decision.

The historical notes below describe the previous preview state and are retained for migration context.

# CardNest private preview — 2026-09-27

## Implemented
- Illustrated Great Nest homepage, guardian-family exploration, V1/V2/V3 chapter navigation.
- Seven concept cards based on supplied artwork. Printed source prices/supply are not live product terms.
- Free preview packs: Hatchling 1 guaranteed Sproutling; Nest 3, Guardian 5, Royal Nest 7 drawn without replacement from 7 concepts. One immutable draw per pack per account; repeats across packs allowed. Unique collection deduplicates cards. Draw and awards commit in one D1 batch before animation.
- Pack-opening demo intentionally does not award cards. Saved openings can replay.
- Founder Art Studio: briefs, provider adapter, image storage, status machine, review notes. Founder API authorization checks configured email against trusted platform identity. No public generation endpoint or auto-publication.
- Live generation remains disabled until secure OPENAI_API_KEY setup and an explicitly approved daily call limit. A call limit is not a dollar cap. One image per authorized click; no automatic retry. Failed/timeout calls may still incur provider charges.
- Founder-only pricing model persists assumptions. No checkout price mutation or live finance integration.

## Brand and family launch gates
A preliminary web check found cardnest.ca (Canadian card retailer), cardnest.co (binder service), and additional similarly named stores. This is not a comprehensive trademark search or a legal determination. The working name and logo need qualified clearance before public commercial use. Do not assert legal clearance.

Sources:
- https://www.uspto.gov/trademarks/search/comprehensive-clearance-search-similar-trademarks
- https://cardnest.ca/pages/about-us
- https://cardnest.co/
- https://www.copyright.gov/newsnet/2025/1060.html
- https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business

Human creative contributions and rights provenance must be recorded; a prompt alone does not guarantee US copyright protection. Studio approval is an internal checkpoint, not attorney approval.

Remain owner-private. This hosted preview requires platform sign-in before access and is not a public under-13 experience. A future mixed-audience launch needs a reviewed age/consent architecture before collection, processor and hosting assessment, parent rights, data deletion/retention, privacy notices with verified operator information, and age-appropriate account terms. No simple checkbox claims compliance.

## Pricing assumptions
Currency USD. Sales tax excluded. One paid pack per order; fixed transaction fee once per paid pack. Refund reserve is applied to discounted revenue without a credit for unrecovered fees or fulfillment. Goods, fulfillment, variable costs and monthly costs are user inputs. Artwork fixed budget is allocated over total forecast pack units. Free packs incur costs but no payment fee. Scenario prices never change customer checkout. Sample scenario is hypothetical, not a quote or forecast.

## AI source
Provider adapter based on https://developers.openai.com/api/docs/guides/image-generation (reviewed 2026-09-27). Model configured by NEST_IMAGE_MODEL. Cost/availability must be verified during activation.

The built-in image-generation tool created public/art/great-nest-world.png during this conversation. Prompt: premium original wide fantasy illustration; floating nest village, giant tree nest houses, turquoise river, three original leafy/amber/tide guardians discovering a luminous golden seed; quiet left area for separate HTML text; jewel colors and golden light; no third-party franchise imagery, text, logos, prices, watermarks, or artist imitation. Human approval of the scene was given in chat; commercial rights review is still pending.

## Remaining connections
Secure API-key provisioning, approved image-generation budget, public account system and family privacy design, payments, affiliate reporting, email delivery, live actual-cost feeds, continuous monitoring, and automatic deployment controls. Do not describe these as operating autonomously.


## Production activation status — 2026-09-28
Production Neon Auth was provisioned on the production database branch and the public CardNest domain was added as a trusted origin. Production environment configuration was supplied in Vercel; this commit triggers a fresh production build so runtime services receive the updated environment.
