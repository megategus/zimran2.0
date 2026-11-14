# QuizOption

One answer button in the 3-question quiz; four per question, stacked with `space-3` gaps.

- Consumer provides: option text, letter A–D, state (`idle`, `selected`, `correct`, `wrong`).
- `idle`: `surface`, 2px `line-strong` border, `press-neutral`. `selected`: border and letter in `brand`. `correct`: `brand-soft` fill, `brand` border, check mark and the word "Correct". `wrong`: `brake-soft` fill, `brake` border, cross and "Not quite".
- State never relies on color alone. Grading happens on the server; the client only shows the result.
