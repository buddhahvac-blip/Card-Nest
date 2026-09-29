# CardNest authenticity numbering

Season One uses two identifiers with different jobs.

## Catalog number

Every design has a permanent public catalog code:

`CN1-001` through `CN1-369`

On the card face/index, show it as `CN1-052 / 369`. This identifies the card design and its position in *Season One: The First Flight*. The catalog number is the same on every copy of that design.

## Copy serial

Every officially issued digital or physical copy should also have its own copy serial:

`CN1-052-<26-character token>`

The token is a reversible Crockford Base32 encoding of the existing immutable `copies.id` UUID. No new database column is required, and duplicate serial issuance is prevented by the existing primary key on `copies.id`.

A public verifier is available through:

`GET /api/authenticity?serial=<copy-serial>`

The verifier returns only non-private card/copy facts. It never exposes the collector account or user id.

## Printing rules

- The master artwork carries only the catalog label, e.g. `CN1-052 / 369`.
- A unique copy serial must never be baked into the reusable master artwork.
- If physical copies are produced later, place the unique copy serial (and optionally a QR code pointing to the verifier) on the card back, certificate, or a variable-data print layer.
- A database match proves that the serial is an issued CardNest record; it does not by itself prove that a physical object has not been counterfeited. Physical production should pair the serial with tamper-resistant printing/packaging if that becomes part of the product.
- Unreleased/review-only cards remain unreleased even if a preview copy record exists.
