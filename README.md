# Wrenchly

A short daily course about **your own car**. Enter a VIN, take 5-minute lessons written by Claude for your exact make, model and year, answer a quiz, and keep a streak. Pro adds an AI Mechanic that reads photos of your car and a 3D Brake Lab where you take a brake assembly apart.

Built for Business Cup 2.0 (Skills track).

**Live:** _PROD_URL_ (no login needed)

## Demo walkthrough

1. Open the live URL and press **Try demo**. You get a 2018 Honda Civic and a 7-day streak, labeled `DEMO`.
2. Open **Brakes → lesson 1**. The lesson is generated live for the car, then a 3-question quiz awards XP.
3. Press **Simulate next day** to watch the streak grow.
4. Open **Brakes → lesson 2**. It's premium, so you land on **/pricing**.
5. Pay in Stripe test mode with card `4242 4242 4242 4242`, any future date, any CVC.
6. Open **AI Mechanic**, attach a photo (JPEG, PNG or WebP up to 5 MB) and ask a question. The reply knows the car and links to lessons.
7. Open the **3D Brake Lab**, drag the explode slider, click the caliper and take its quiz.
8. Open a **Coming soon** course such as Electrical and press **Notify me**.

To use your own car, press **Start with my car** and enter a 17-character VIN, or pick the year, make and model.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind 4 · Supabase Postgres · Anthropic Claude · Stripe Checkout (test mode) · three.js via `@react-three/fiber` · zod · vitest. Hosted on Vercel.

Guests are identified by an httpOnly `guest_id` cookie. All data access runs in server route handlers with the Supabase service-role key. Every table has row-level security on with no public policies. Generated lessons are cached per car and lesson. Uploaded photos go to Claude and are never stored.

## External services

| Service | Used for | Key needed |
|---|---|---|
| NHTSA vPIC (`vpic.nhtsa.dot.gov`) | VIN decode: year, make, model, engine, specs | No |
| NHTSA Recalls (`api.nhtsa.gov/recalls`) | Open recalls for the car | No |
| Anthropic Claude | Lessons, quizzes, AI Mechanic chat with vision | Yes |
| Stripe (test mode) | Subscription checkout, verified on return | Yes |
| Supabase | Postgres database | Yes |

## Run locally

```bash
npm ci
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Apply the schema in `supabase/migrations/0001_init.sql` to your Supabase project (SQL editor or `supabase db push`).

```bash
npm test        # unit tests
npm run build   # production build
```

### Environment variables

| Name | Notes |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Never exposed to the browser. |
| `ANTHROPIC_API_KEY` | Set a monthly spend limit |
| `ANTHROPIC_MODEL` | Default `claude-sonnet-5-5` |
| `STRIPE_SECRET_KEY` | Test-mode key (`sk_test_…`) |
| `NEXT_PUBLIC_APP_URL` | Base URL for Stripe redirects, e.g. `http://localhost:3000` |

Secrets live only in `.env.local` (gitignored) and in Vercel project settings.

## Pricing

Free: the first lesson of Brakes, Oil & Fluids and Tires & Wheels. Pro: $9.99 a month or $59.99 a year for all lessons, the AI Mechanic and the 3D Brake Lab.

## Safety

Lessons and chat replies include a safety note for brakes, jacking, airbags, hot coolant and EV high voltage. Cost figures are estimates and vary by region. AI advice can be wrong: when in doubt, see a professional mechanic.

## Docs

- Design spec: `docs/superpowers/specs/2026-11-15-wrenchly-design.md`
- Implementation plan: `docs/superpowers/plans/2026-11-15-wrenchly.md`
- Design system: `docs/design/`
