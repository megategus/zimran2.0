# CarCard

The user's car on `/app`: decoded NHTSA specs and open recalls.

- Consumer provides: year, make, model, trim, engine, drivetrain, VIN (optional), recalls list.
- `surface` card, `radius-lg`. Title in `h2`. VIN and specs in `data` inside a `surface-sunken` well; spec labels in `label` `ink-muted`.
- Each recall: a `brake-soft` row with a "RECALL" tag and the campaign number in `data`. No recalls: "No open recalls" in `ink-muted`.
- Source line in `caption`: "Specs and recalls from NHTSA."
