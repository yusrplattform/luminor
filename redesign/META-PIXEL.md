# Meta Pixel draft

The Vercel root directory is `redesign`. `NEXT_PUBLIC_META_PIXEL_ID` is a public,
build-time setting; it defaults to `1754919566679769`. Configure a separate test
Pixel ID in a separate preview build if real Meta Test Events are required. Do
not put an access token in `NEXT_PUBLIC_*` or browser code. Changing a public
variable requires a new build.

Consent is stored in `luminor-marketing-consent-v2`; rejection and no choice
both prevent loading the Meta SDK. Purchase requires the existing server-side
OMPAY reconciliation to report a paid order, plus marketing consent. Before
enabling Purchase tracking, apply `lib/meta-purchase.sql` to the same database
as `orders`. The unique order claim prevents repeat emission from refreshes and
multiple tabs; a stable SHA-256 event ID is supplied to Meta. The claim is made
before the browser emits, so a blocked SDK, network failure, or revoked consent
can result in an unreported purchase; this is at-most-once, not guaranteed
delivery. A durable server-side Conversions API integration would be needed for
retries and delivery acknowledgement, with separate consent handling.

To avoid exposing order data, ordinary tracking is skipped on checkout paths
and on URLs with unknown query strings or fragments. Recognized campaign query
parameters are removed from the address after consent before the Pixel loads.
The return page strips the query
from the browser URL before a consented, paid Purchase is emitted. This means
URLs containing other query parameters do not generate PageView until a
subsequent clean navigation. Browser Pixel still shares technical identifiers
and network metadata with Meta after consent.

Run `node --test test-meta-browser.cjs test-meta-purchase.mjs test-quote.mjs
test-ompay.mjs` from `redesign`. The browser test uses a fake Pixel ID and a
local receiver; it never contacts Meta and does not prove delivery to Meta.
Production deployment, database changes, and advertising publication are
separate steps and are not performed by these tests.
