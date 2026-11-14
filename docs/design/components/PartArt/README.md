# PartArt

Flat car-part illustrations drawn as inline SVG from the tokens, so they follow the light and dark themes. Use them on course map headers, lesson cards, part tiles in the 3D lab, and coming-soon pages.

- Consumer provides: the part key (`rotor`, `caliper`, `pads`, `wheel`, `dipstick`, `oil-filter`, `battery`, `spark-plug`, `coolant`, `shock`, `gear`, `ev-plug`), a size (48, 72 or 96px), and an accessible label.
- Drawing rules: 96×96 viewBox, 3px `ink` outline with round joins, solid fills only from tokens. No gradients, no shading, no text inside the art.
- Fill roles: `plate` for metal and housings, `surface-sunken` for friction and machined surfaces, `brand` for the part's key working element, `amber` for oil, fluids at work and electricity, `brake` for parts with a safety meaning (caliper, battery positive, hot-coolant cap).
- Tile: `surface` card, `radius-lg`; selected in the 3D lab = 2px `brand` border, `press-brand`, "IN 3D LAB" tag.
- Inline the SVG (not `<img>`) so the theme tokens reach it.
