# StreakBar

Top bar of `/app` and lesson screens: streak, XP, Pro status, the DEMO tag, and lesson progress.

- Consumer provides: streak days, XP total, isPremium, isDemo, lesson progress (0–1) on lesson screens.
- Chips are `radius-pill`. Streak: flame on `amber`, count in `stat` with `on-amber`. XP: `stat` in `amber-ink` on `surface`. Pro: `plate` chip.
- DEMO tag: `amber` fill, `label` text, `radius-sm`; pair it with a secondary "Simulate next day" button.
- Lesson progress: `surface-sunken` track, `brand` fill, `radius-pill`, 10px tall.
