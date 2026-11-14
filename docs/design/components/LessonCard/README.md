# LessonCard

One teaching card in a lesson, one per screen, of kind `what`, `how`, `breaks` or `fix`.

- Consumer provides: kind, heading, body (from the lesson JSON), car line ("2019 Honda Civic EX · 1.5L turbo"), and for `fix` the DIY and shop cost strings.
- `surface` card, 1px `line` border, `radius-lg`, padding `space-5`. Eyebrow in `label` `brand` names the kind: "WHAT IT IS", "HOW IT WORKS", "WHAT BREAKS", "DIY OR SHOP". Heading `h2`, body `body-lg`, at most 65ch.
- Costs in `data`, colored `amber-ink`, followed by `caption` "Estimate, varies by region."
- If the lesson has a safety note, place SafetyNote directly under the card.
