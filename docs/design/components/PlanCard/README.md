# PlanCard

Pricing option on `/pricing` and in the paywall sheet, always shown as a monthly and yearly pair.

- Consumer provides: plan name, price, period, savings note, feature list (3 lines max), highlighted flag.
- Monthly: `surface` card, 1px `line` border, secondary button. Yearly (highlighted): `plate` fill, `on-plate` text, "SAVE 50%" tag on `amber`, primary button.
- Price in `stat`, period in `caption`. Feature checks in `brand` (on plate they take `on-plate`).
- Under the pair, in `caption`: "Stripe test mode. No real charge."
