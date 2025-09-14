PacePop — Minimalist Landing Page with Waitlist

Overview
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Clean, modern UI with rounded corners and a yellow→orange accent gradient
- Sticky Navbar → Hero → Features → Pricing (Coming soon) → FAQ → Signup → Footer
- API route to subscribe emails to Supabase (`waitlist_signups`), duplicate-safe
- Accessible focus states, mobile-first, dark mode toggle, subtle animations

Getting Started
- Install: `pnpm i`
- Dev: `pnpm dev`

Environment
Create a `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
```
Do not expose `SUPABASE_SERVICE_ROLE` to the client. It is only used on the server API route.

Database Schema (Postgres / Supabase)
```
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_key on public.waitlist_signups(email);
```

Architecture Notes
- Tailwind exposes the accent as `accent` color: `text-accent`, `ring-[hsl(var(--accent))]`
- Gradient utility: `bg-accent-gradient` → `linear-gradient(90deg, var(--accent-from), var(--accent-to))`
- Dark mode via `class` strategy; toggle stores preference in `localStorage` (`pacepop-theme`)
- Rate limiting: simple in-memory token bucket (5 requests / 10 minutes per IP)
- Animations: framer-motion fade/slide in key sections

Key Files
- `app/page.tsx`: Landing page sections and layout
- `app/api/subscribe/route.ts`: Zod validation + Supabase insert; returns `{status:"already_subscribed"}` for duplicates
- `components/SignupForm.tsx`: React Hook Form + Zod + inline toasts
- `components/Navbar.tsx` / `components/ThemeToggle.tsx`: sticky nav and theme control
- `styles/globals.css`: CSS vars + Tailwind base + reusable utilities
- `lib/supabase.ts`: Supabase public and service clients
- `lib/rateLimit.ts`: Request throttle utility

Accessibility
- Focus-visible rings use the accent color with sufficient contrast in dark mode
- Buttons and links have visible focus states; form has ARIA attributes

Production Considerations
- The included rate limiter is in-memory and resets on redeploy; use a shared store (e.g., Upstash Redis) in production
- Ensure `waitlist_signups.email` has the unique index for duplicate handling to return `{status:"already_subscribed"}`

