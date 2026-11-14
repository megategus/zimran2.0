# Wrenchly — design

Working name "Wrenchly" (placeholder, rename freely). Hackathon: Business Cup 2.0, Skills track. Deadline 12:00, Nov 15.

## Intent and why

US adults 25–45 own a car but do not understand it. Every shop visit is a blind trust exercise: "your rotors are shot, $640". They overpay for repairs they could judge, or do themselves, if they knew what the part is, how it fails and what a fair fix costs.

Wrenchly is a Duolingo-style web course about **your own car**: short daily lessons, quizzes, XP and streaks, every lesson written around the user's exact make/model/year. Paid tier adds an AI mechanic chat that reads photos of the user's car, and a 3D lab where parts can be taken apart and learned.

Why it wins on the judging criteria:
- Works (40%): one real end-to-end flow, live NHTSA data + live Claude generation, no canned answers.
- What we sell (20%): subscription; comes back daily for streak + next lesson of a course built on their car.
- Who (15%): US car owners 25–45, non-mechanics, who fear being overcharged.
- Money (15%): avg US repair+maintenance spend is large; saving one unnecessary repair pays a year of subscription.
- New (10%): not a generic course or a ChatGPT wrapper; structured path + per-car personalization + progress (FAQ Q32).

## Goals

1. Guest opens prod URL, no login, and completes the core flow end-to-end.
2. Core flow:
   1. Enter VIN (or pick make/model/year). NHTSA vPIC decodes specs; NHTSA recalls API returns real recalls.
   2. Course map shows 8 courses. 3 work: **Brakes**, **Oil & Fluids**, **Tires & Wheels** (3 lessons each). 5 show "Coming soon" pages with outline + "Notify me" (writes to DB): Electrical, Cooling, Suspension, Transmission, EV Basics.
   3. Lesson: Claude generates content personalized to the car (what it is, how it works, what breaks + symptoms, DIY vs shop with cost range), then a 3-question quiz. XP + streak update.
   4. Paywall after free lessons, clear price, Stripe test-mode checkout.
   5. Premium unlocks: all lessons, **AI Mechanic chat** (separate page, text + photo, Claude vision, knows car + progress, recommends lessons with links), **3D Brake Lab** (rotate, explode, click a part, learn it).
3. Demo mode: one-click "Try demo" seeds a car and a week of activity; "Simulate next day" button advances time. Clearly labeled DEMO (FAQ Q35).
4. Data persists in a database.

## Non-goals

- Real accounts, email login, password reset.
- Real payments (test mode only).
- Native mobile app (forbidden). Mobile-responsive web is welcome.
- Per-model 3D car models. One procedural brake assembly only.
- Courses beyond the 3 working ones.

## Anti-goals (fail even if it "works")

- Any hardcoded lesson or chat answer that does not depend on input (FAQ Q3, Q66).
- Clickable buttons that do nothing. Every "Coming soon" opens a real page.
- Judges hit a login wall, a broken deploy or an exhausted API key.
- Secrets in the public repo.
- Unsafe repair advice without warnings (brakes, airbags, EV high voltage, jacking).

## Constraints

- About 10 hours from now (01:35) to 12:00 deadline, deck included.
- 3 Claude Code agents working in parallel.
- Public GitHub repo, commit history visible, code written during hackathon.
- Deck: English, ≤10 slides, numbers with sources (RevenueCat/Adapty benchmarks).
- Link must work through end of Nov 15 finals.

## Approaches considered

| Option | Trade-off | Verdict |
|---|---|---|
| A. Next.js on Vercel, localStorage only | Fastest, but no DB; user wants a DB | Rejected by user |
| **B. Next.js on Vercel + Supabase Postgres** | +~1h setup, one more service; real persistence, cached lessons, stronger "accumulated data" story | **Picked by user** |
| C. Vite SPA + separate API on Render | Two deploys, more moving parts, no gain | Dropped |

## Decided (by user)

- Web app with a database.
- Claude API for photo recognition.
- Separate AI chat page in the app.
- 3 working courses in core flow, the rest clickable "coming soon".
- AI mechanic shows course personalization.
- 3D learning where at least one part can be selected and learned.

## Builder's calls (stated, correctable)

- **Stack:** Next.js 15 App Router, TypeScript, Tailwind, Supabase Postgres, `@anthropic-ai/sdk`, `stripe`, `@react-three/fiber` + `@react-three/drei`, `zod`. Deploy: Vercel.
- **Identity:** server sets an httpOnly `guest_id` cookie (UUID) on first visit; a `guests` row is created. All DB access goes through server routes with the Supabase service-role key. RLS enabled with no public policies, so the anon key cannot read anything.
- **Model:** `ANTHROPIC_MODEL` env var, default `claude-sonnet-5-5` (vision + JSON, fast). Lessons are generated once per (car, lesson) and cached in DB.
- **Photos:** sent to Claude as base64, not stored. Only the chat text is saved. Max 5 MB, jpeg/png/webp.
- **Free tier:** lesson 1 of each working course. Premium: everything else + chat + 3D lab.
- **Price:** $9.99/mo or $59.99/yr (deck justifies). Stripe Checkout in test mode; on return, server verifies the session with Stripe and sets `guests.is_premium = true`. No webhook.
- **3D:** brake assembly built from three.js primitives in code (rotor, caliper, pads, bracket, hub). No external assets, no licensing risk. Clicking a part opens a mini-lesson generated by the same lesson pipeline (`part:caliper` etc.).
- **Cost estimates** are Claude estimates, labeled "estimate, varies by region".
- **Safety:** every lesson and chat answer includes a safety note when the topic involves brakes, jacking, airbags, hot coolant, or EV high voltage. The system prompt enforces "when in doubt, see a pro".

## Data model

```
guests(id uuid pk, created_at, is_premium bool default false, day_offset int default 0, xp int default 0, is_demo bool default false)
cars(id uuid pk, guest_id fk, vin text null, year int, make text, model text, trim text null, engine text null, specs jsonb, recalls jsonb, created_at)
lessons(id uuid pk, car_id fk, lesson_key text, content jsonb, created_at, unique(car_id, lesson_key))
progress(guest_id fk, lesson_key text, score int, completed_at timestamptz, pk(guest_id, lesson_key))
activity(guest_id fk, day date, pk(guest_id, day))
chat_messages(id uuid pk, guest_id fk, role text, content text, had_image bool, created_at)
notify_requests(guest_id fk, course_key text, created_at, pk(guest_id, course_key))
```

Course catalog (titles, lesson keys, learning objectives) lives in code (`src/content/catalog.ts`). Only generated lesson bodies live in DB.

## API contract

| Route | In | Out |
|---|---|---|
| `POST /api/guest/demo` | — | seeds demo car + 7 days activity, sets cookie |
| `POST /api/guest/next-day` | — | `day_offset += 1` (demo only) |
| `GET /api/me` | — | `{guest, car, progress[], streak, xp}` |
| `POST /api/car` | `{vin}` or `{year, make, model}` | `{car}` (NHTSA decode + recalls) |
| `GET /api/lessons/[key]` | — | `{lesson}`; 402 if premium-gated; generates + caches on miss |
| `POST /api/lessons/[key]/complete` | `{answers[]}` | `{score, xpGained, streak}` (server grades) |
| `POST /api/notify` | `{courseKey}` | `{ok}` |
| `POST /api/chat` | multipart `{message, image?}` | streamed text; 402 if not premium |
| `GET /api/chat` | — | history |
| `POST /api/checkout` | `{plan}` | `{url}` Stripe Checkout |
| `GET /api/checkout/verify?session_id=` | — | sets premium, redirects `/app?upgraded=1` |

Lesson JSON (zod-validated):
```
{ title, carLine, cards: [{kind: "what"|"how"|"breaks"|"fix", heading, body}],
  costs: {diy: string, shop: string}, safety: string|null,
  quiz: [{q, options: [4], answerIndex}] x3 }
```
`answerIndex` is never sent to the client; grading is server-side.

## Pages

`/` landing + "Try demo" + "Start with my car" · `/onboarding` VIN/make-model · `/app` course map, XP, streak, car card, recalls · `/lesson/[key]` cards then quiz · `/course/[key]` coming-soon page · `/pricing` paywall · `/chat` AI Mechanic · `/lab` 3D Brake Lab.

## Left to the builder

Visual style, copy, exact prompt wording, loading states, component structure, streak edge cases (time zones: use server date + `day_offset`).

## Feasibility (all functions in code?)

| Function | Code-feasible? | Note |
|---|---|---|
| VIN decode, recalls | Yes | NHTSA vPIC + recalls API, free, no key |
| Personalized lessons | Yes | Claude, cached in DB; accuracy is an LLM limit, labeled |
| Quiz, XP, streak, demo time | Yes | Plain code + DB |
| AI Mechanic chat with photo | Yes | Claude vision; accuracy limited, safety disclaimers |
| Paywall + Stripe test | Yes | Checkout + verify on return |
| 3D part learning | Yes, scoped | One procedural brake assembly; per-car 3D models not feasible in time |
| Coming-soon courses | Yes | Static outline + notify-me row in DB |

## Risks

- Claude latency on first lesson load (5–15 s): show progressive loading copy; pre-generate on car creation in background.
- API key quota exhausted during judging: set a spend limit, cache lessons, one model.
- Supabase free tier pauses after inactivity: not an issue within Nov 15.
