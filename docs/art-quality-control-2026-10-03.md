# Artwork quality control: master-resolution follow-up

The founder requested continued higher-resolution artwork work and ongoing QC. A built-in image-generation preservation edit was attempted for CN1-307 on 2026-10-03. Requested 2048×3072; actual result 1024×1536. Visual inspection found a similar composition with stronger light, but the candidate failed the higher-resolution target. It was not substituted for the approved website source. The generated candidate remains a conversation review artifact, not a pack asset or approved replacement.

## Automatic deployment check

`npm run quality:showcase` now runs in prebuild after the existing tests and Guardian Enforcer. It decodes each source, checks real dimensions against metadata, verifies SHA256, enforces a 1024×1536 existing-source floor, rejects avatar/thumbnail source paths, checks 2:3 aspect ratio and a 4 MiB display-source budget, and requires unreleased/non-collectible/non-pack-eligible status.

`node scripts/check-showcase-quality.mjs PATH_TO_CANDIDATE` additionally rejects replacement masters smaller than 1280×1920. Passing these technical checks does not establish original artistic quality, rights clearance, or authentic native detail: visual review is still required. No resampling is used to claim higher native resolution.

Six current images pass. The generated candidate is correctly rejected at 1024×1536. Browser installation failed TLS certificate validation (UnknownIssuer); no certificate bypass was attempted. Phone, screen-reader, modal interaction and production browser checks remain outstanding. Previously verified rendered HTML and HTTP checks are not substituted for those interaction checks.

## Generation record

Method: built-in image tool, identity-preserve edit using the approved Aurora source-v1.webp. Final prompt:

> Use case: identity-preserve. Edit target: supplied approved CardNest Aurora Herald illustration. Produce a true high-resolution preservation master, portrait 2:3, requested output 2048 x 3072 pixels or the highest available portrait resolution. This is a detail refinement, NOT a redesign. Preserve exact creature identity, white aurora stag, crystal antlers, broad layered shield collar with celestial markings, existing stance, face, four legs, anatomy, framing, floating sanctuaries, waterfall placements, glowing pathway and aurora sky. Refine fine fur, stone, flowers, distant architecture and luminous edge clarity with clean natural detail; no oversharpened halos, waxy textures, doubled limbs, extra antlers, cropping or extra objects. Preserve premium painterly illustration and approved teal/lavender/gold light. No letters, numbers, frame, logos or watermarks. Original family-friendly CardNest IP.

Genuine larger masters remain pending. The image-generation skill allows a CLI/API fallback for explicit resolution control only when the user expressly chooses that path; it requires an API key set securely in the execution environment, not pasted into chat. No paid API fallback was used.
