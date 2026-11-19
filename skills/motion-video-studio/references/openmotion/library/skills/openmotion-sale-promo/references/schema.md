# offer.json

```json
{
  "brand": { "name": "Fieldwork Supply", "accent": "#ff3b30" },
  "occasion": "Black Friday",
  "theme": "black-friday",
  "postDate": "2026-11-24T09:00:00-05:00",
  "product": { "name": "Canvas Daypack 22L", "image": "backpack.jpg", "was": 89, "discount": { "percent": 40 } },
  "currency": "USD",
  "locale": "en-US",
  "code": "FRIDAY40",
  "deadline": { "label": "Ends Mon, Dec 1 · 11:59 pm ET", "date": "2026-12-01T23:59:00-05:00" },
  "cta": "Shop the sale",
  "url": "fieldworksupply.example",
  "aspect": "9:16",
  "duration": 10,
  "labels": { "off": "OFF", "useCode": "Use code", "save": "Save" }
}
```

| Field | Rule |
| --- | --- |
| `brand.name` | Required, ≤ 24 characters. `accent` optional `#rrggbb`. |
| `occasion` | Required, ≤ 18 characters; also picks the default theme. |
| `product.was` | Regular price, a positive number. |
| `product.discount.percent` / `product.discount.amount` / `product.now` | Exactly one. Percent 1–95; amount below `was`; `now` below `was`. |
| `product.image` | Optional path next to `offer.json` (png, jpg, webp, svg). Without it the card shows the product name. |
| `code` | Required, 3–16 of `A–Z 0–9 -`. |
| `deadline.label` | Required, ≤ 34 characters, written the way the shop says it. `deadline.date` is the same moment as ISO 8601 with offset. |
| `postDate` | Optional ISO date; the check fails when the deadline is not after it. |
| `cta` | Required, ≤ 18 characters. `url` ≤ 32 characters. |
| `currency`, `locale` | ISO 4217 code and BCP 47 locale for `Intl.NumberFormat`. |
| `aspect`, `duration` | `9:16` (default), `4:5`, `1:1`, `16:9`; 10 (default) or 15 seconds. |

The headline uses the percentage unless the saving is under 10 units or under 10%, where a flat amount
reads better; `discount.amount` always shows the amount. Values on screen are rounded to cents.
