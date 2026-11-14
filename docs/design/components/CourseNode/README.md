# CourseNode

Round node on the course map, one per lesson, in a zigzag column spaced `space-7`.

- Consumer provides: state (`done`, `current`, `locked`, `soon`), lesson title, href.
- `current`: `brand` disc with `press-brand`. `done`: `brand-soft` disc with a check in `brand`. `locked` (premium): `surface-sunken` disc, lock icon, `ink-muted`. `soon`: dashed `line-strong` ring with the word "Soon".
- Every node is a link: `locked` goes to `/pricing`, `soon` goes to `/course/[key]`.
- Don't: a node that does nothing on click.
