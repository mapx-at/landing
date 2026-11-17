---
title: "Geocoding API Austria: address search and autofill"
crumb: "Geocoding and address search"
key: geocoding
layout: topic
translationKey: geocoding
url: /en/geocoding-api/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Geocoding API for Austria: address search, reverse geocoding, address autofill and address validation against the official address register. Free with a token."
---

# Geocoding API for Austria: address search, autofill and validation

<p class="mx-lead">The geocoding API turns addresses and place names into coordinates and coordinates into the nearest address. It also offers suggestions while typing, address autofill for forms and address validation. It is meant for developers who want to search, complete or check addresses in Austria in websites, apps and backends.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
{{< hextra/hero-button text="Docs: address search" link="https://docs.mapx.at/guides/search/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

## What the API can do

- `GET /v1/geocode`: forward geocoding of addresses, streets, places, postcodes, districts and parcels. Road kilometers such as `A1 km 41` can be searched as well.
- `GET /v1/reverse`: reverse geocoding, the nearest address, street or place to a point.
- `POST /v1/geocode/batch`: up to 1000 requests in one call.
- `GET /v1/searchbox/suggest` and `/v1/searchbox/retrieve/{id}`: suggestions while typing and details of the chosen result.
- `GET /v1/autofill/suggest` and `/v1/autofill/retrieve/{id}`: address autofill with separate fields for street, house number, postcode and place.
- `GET /v1/address/validate`: address validation with the status `match`, `corrected`, `ambiguous` or `not_found`.

## Example

Turn an address into coordinates:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/geocode?q=Herrengasse%2013%20Wien&limit=3&types=address" | jq
```

```js
const res = await fetch("https://api.mapx.at/v1/geocode?q=Herrengasse%2013%20Wien&limit=3&types=address", { headers: { Authorization: "Bearer YOUR_TOKEN" } });
const data = await res.json();
```

The nearest address to a point (coordinates are always `lon,lat`):

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/reverse?lng=16.3725&lat=48.2085&limit=1&types=address" | jq
```

Validate an address:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/address/validate?q=Herrengasse%2013,%201010%20Wien" | jq
```

## Where the data comes from

Addresses, geographic names, administrative boundaries and cadastre come from the Federal Office of Metrology and Surveying (BEV) and are licensed under CC BY 4.0. The autofill uses only the official address register of the BEV. Points of interest in the search come from official sources, not from OpenStreetMap.

## Limitations

- Austria only.
- The search falls into the zone `search` with 10 requests per second per token, the batch request into the zone `heavy` with 30 requests per minute. When you exceed a limit the API answers `429` with `Retry-After`.
- The batch request takes at most 512 KB and 1000 requests per call.
- Always pass `types` to keep queries cheap.
- Address validation compares with the official register. For `ambiguous` it returns up to 5 candidates instead of one address.
- The source must be shown visibly, JSON responses carry an `attribution` field for this.

## Get started

Access is free with an account and a token. All endpoints and parameters are in the [geocoding API reference](https://docs.mapx.at/api/geocoding/), the [address search guide](https://docs.mapx.at/guides/search/) and the [autofill and validation reference](https://docs.mapx.at/api/address/).

<div class="mx-btns">
{{< hextra/hero-button text="Sign up for free" link="https://account.mapx.at/register?lang=en" >}}
</div>
