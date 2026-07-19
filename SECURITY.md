# Notiq AI — Security checklist

## 1. API keys — status: SAFE
- **Groq, Gemini, OCR, Supadata, Supabase service_role, webhook key** → all live only as
  Vercel Environment Variables (server-side). None are in the code the browser downloads.
- **config.js** ships to the browser and contains the Supabase URL + **anon key**. This is
  correct and safe *by design* — the anon key is meant to be public. It is only safe because
  Row Level Security (section 3) is on. Never put the Groq key or the service_role key here.
- The `AIza...` string in `api/youtube.js` is **YouTube's own public web key**, not a private
  credential. Harmless.
- The real Groq key stays in your LOCAL config.js only (git `--skip-worktree`, never committed).

## 2. Login brute-force protection
Bots don't go through the webpage, so client JS can't stop them. Real protection:
- **Supabase already rate-limits auth** per IP automatically (sign-in attempts are throttled).
- **Turn on CAPTCHA (free, ~5 min):**
  1. Make a free site at https://www.cloudflare.com/products/turnstile/ → get a **site key** + **secret key**.
  2. Supabase → Authentication → **Settings** → **Bot and Abuse Protection** → enable → paste keys.
  That stops automated password-guessing at the source.
- The sign-in page also has a light client-side slow-down (locks the button 20s after 5 wrong tries) — UX only.

## 3. Row Level Security (RLS) — VERIFY THIS
RLS is what keeps user A from reading user B's data. Run this in Supabase → SQL Editor.
Every row must show `rowsecurity = true`:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

If ANY table shows `false`, lock it down. This turns RLS on for every table Notiq uses and
adds the owner-only policies (safe to re-run — `if not exists` / `drop policy` guards):

```sql
-- enable RLS everywhere
alter table if exists folders      enable row level security;
alter table if exists resources    enable row level security;
alter table if exists saved_items  enable row level security;
alter table if exists profiles     enable row level security;
alter table if exists activity     enable row level security;
alter table if exists presence     enable row level security;
alter table if exists boards       enable row level security;

-- owner-only access (each user sees only their own rows)
do $$ begin
  perform 1; -- folders
  drop policy if exists "own folders" on folders;
  create policy "own folders" on folders for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists "own resources" on resources;
  create policy "own resources" on resources for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists "own saved_items" on saved_items;
  create policy "own saved_items" on saved_items for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists "own activity" on activity;
  create policy "own activity" on activity for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists "own presence" on presence;
  create policy "own presence" on presence for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  drop policy if exists "own boards" on boards;
  create policy "own boards" on boards for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);

  -- profiles: users read/insert their own; NO update policy (so no self-upgrade to Pro)
  drop policy if exists "read own profile" on profiles;
  create policy "read own profile" on profiles for select using (auth.uid() = user_id);
  drop policy if exists "insert own profile" on profiles;
  create policy "insert own profile" on profiles for insert with check (auth.uid() = user_id);
end $$;

-- shared-folder read access (only folders explicitly marked is_shared)
drop policy if exists "anyone can view shared folders" on folders;
create policy "anyone can view shared folders" on folders for select
  using (is_shared = true);
drop policy if exists "anyone can view items in shared folders" on saved_items;
create policy "anyone can view items in shared folders" on saved_items for select
  using (exists (select 1 from folders f where f.id = saved_items.folder_id and f.is_shared = true));
```

Re-run the verify query afterward — all `true`.

## 4. Privacy policy — DONE
- `privacy.html` and `terms.html` exist and are linked from the footer, the sign-in page
  (consent line), and each other. Keep the contact email current.
- Because you collect email + user content and (via Ko-fi) process payments, having these
  pages published is the baseline that keeps you clear of most consumer-privacy complaints.
