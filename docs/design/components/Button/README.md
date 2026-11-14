# Button

Chunky press button: one `brand` primary per screen, secondary for everything else, `plate` for the Pro upsell.

- Consumer provides: label text (verb first, rendered uppercase like `label`), variant (`primary`, `secondary`, `pro`), optional disabled state.
- Primary: `brand` fill, `on-brand` text, `press-brand` shadow. Secondary: `surface` fill, 2px `line-strong` border, `press-neutral`. Pro: `plate` / `on-plate`.
- `:active` moves down 4px and drops the shadow. Disabled: `surface-sunken` fill, `ink-muted` text, no shadow.
- Full width at the bottom of lesson and quiz screens on phones.
- Don't: two primaries side by side, icon-only buttons, buttons that do nothing.
