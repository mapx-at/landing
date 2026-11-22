---
title: "Static Maps API: map as an image (PNG, WebP)"
crumb: "Static map images"
key: statisch
layout: topic
translationKey: statisch
url: /en/static-maps/
lastmod: 2026-11-17
images: ["/img/og-image.png"]
description: "Static maps for Austria as PNG or WebP with pins, paths and GeoJSON: a map image for reports, e-mails and property listings. Free with an account and token."
---

# Static maps: a map as an image for reports, e-mails and property listings

<p class="mx-lead">The static images API renders a map image for an extent and a size, optionally with pins, lines and areas. The result is a PNG or WebP that you embed by URL in PDFs, e-mails, property listings or previews. It is meant for developers who need a map where an interactive map is not possible.</p>

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
{{< hextra/hero-button text="Docs: static images" link="https://docs.mapx.at/guides/static-images/" style="background:transparent;color:inherit;border:1px solid rgb(156 163 175 / .5)" >}}
</div>

{{< demo id="statisch" >}}

## What the API can do

- `GET /v1/static/{style}/{view}/{size}`: a map image without overlay. `view` is `lon,lat,zoom[,bearing]`, `size` is width times height, for example `600x400`, with optional `@2x` and the extension `.png` or `.webp`.
- `GET /v1/static/{style}/{overlay}/{view}/{size}`: a map image with overlays. Pins (`pin-s+ff0000(lon,lat)`), paths (encoded polyline) and GeoJSON with simple style properties, up to 50 overlays.
- With `auto` instead of the view the extent fits the overlays.
- Styles: `streets`, `streets-dawn`, `streets-dusk`, `streets-night`, `satellite` (orthophoto), `satellite-streets` and `outdoors` (contour lines with hillshade).

## Example

An aerial image of Vienna:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/static/satellite/16.3725,48.2085,15/600x400" -o result.png
```

A street map with a red pin:

```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api.mapx.at/v1/static/streets/pin-s%2Bff0000(16.3725,48.2085)/16.3725,48.2085,14/600x400" -o result.png
```

In an HTML page or e-mail the token goes into the URL (`access_token`), because images cannot send headers. Use a public token for this:

```html
<img alt="Vienna city center" width="600" height="400"
     src="https://api.mapx.at/v1/static/streets/16.3725,48.2085,14/600x400.png?access_token=YOUR_TOKEN">
```

## Where the data comes from

The images are rendered from the same open government data as the interactive map: the street styles from the vector basemap, `satellite` from the BEV orthophoto, `outdoors` from the BEV terrain model. The data is licensed under CC BY 4.0.

## Limitations

- Austria only.
- At most 1280 by 1280 pixels, with `@2x` up to 2560 by 2560. The pitch is always 0.
- Zoom levels: `satellite` from 5 to 18, `outdoors` from 5 to 16.
- Images fall into the zone `heavy` with 30 requests per minute per token. Images are cacheable (`ETag`, `304`): store them on your side and do not request them anew on every page view.
- The source must be visible next to the image, for example as a line `Source: mapx.at | BEV (CC BY 4.0)`. The text for each dataset is in the [attribution docs](https://docs.mapx.at/reference/attribution/).

## Get started

Access is free with an account and a token. All parameters and overlay formats are in the [static images guide](https://docs.mapx.at/guides/static-images/) and the [static images API reference](https://docs.mapx.at/api/static-images/).

<div class="mx-btns">
{{< hextra/hero-button text="Get started free" link="https://account.mapx.at/login?lang=en" >}}
</div>
