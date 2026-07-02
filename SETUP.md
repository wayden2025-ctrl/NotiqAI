# Notiq AI — Setup Guide

You need to get 3 things and paste them into `config.js`. That's it.

| What | Where to get it | Paste into |
|---|---|---|
| Supabase Project URL | supabase.com → your project → Settings → API | `SUPABASE_URL` |
| Supabase anon public key | same page, under "Project API keys" | `SUPABASE_ANON_KEY` |
| Groq API key | console.groq.com/keys → "Create API Key" | `GROQ_API_KEY` |

---

## Step 1 — Create your Supabase project (free)

1. Go to https://supabase.com and sign up (GitHub or email).
2. Click **New project**. Name it `notiq-ai`, set a database password (save it somewhere), pick the region closest to you. Create.
3. Wait ~2 minutes for it to spin up.
4. Go to **Settings → API**. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
5. Paste both into `config.js`.

## Step 2 — Turn off email confirmation (so sign-up works instantly)

1. In Supabase: **Authentication → Providers → Email**.
2. Turn **OFF** "Confirm email". Save.
   (You can turn it back on later when the site is live — the sign-in page already handles the "check your email" message if you do.)

## Step 3 — Create the database tables

1. In Supabase: **SQL Editor → New query**.
2. Paste ALL of this and click **Run**:

```sql
-- Folders (for saving flashcards, quizzes, notes, study guides)
create table folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Imported resources (notes, lecture slides, pasted text)
create table resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text,
  content text,
  created_at timestamptz default now()
);

-- Saved generated items
create table saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid not null references folders(id) on delete cascade,
  type text not null,          -- 'flashcards' | 'quiz' | 'study_guide' | 'notes'
  title text not null,
  content jsonb not null,
  created_at timestamptz default now()
);

-- Row Level Security: each user only sees their own stuff
alter table folders enable row level security;
alter table resources enable row level security;
alter table saved_items enable row level security;

create policy "own folders" on folders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own resources" on resources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved_items" on saved_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## Step 4 — Create the Storage bucket (saves the uploaded files)

1. In Supabase: **Storage → New bucket**.
2. Name it exactly: `resources`. Keep it **Private**. Create.
3. Back in **SQL Editor**, run this so users can only touch their own files:

```sql
create policy "users upload own files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users read own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = auth.uid()::text);
```

Note: the app also saves the extracted **text** of every upload into the `resources` table — that text is what the AI generates from. The bucket keeps the original file.

## Step 5 — Get your Groq API key (free)

1. Go to https://console.groq.com and sign up.
2. Open **API Keys** → **Create API Key**. Copy it immediately (shown once).
3. Paste it into `config.js` as `GROQ_API_KEY`.

The model is preset to `llama-3.3-70b-versatile` — fast and free-tier friendly. You can change `GROQ_MODEL` in `config.js` anytime.

## Step 6 — Run the site

The pages must be served over http (not double-clicked) for auth to behave. Easiest options:

- **Local:** in the folder, run `npx serve` (needs Node) or `python3 -m http.server 8000`, then open `http://localhost:8000/index.html`.
- **Free hosting:** drag the folder into https://app.netlify.com/drop — done. (Then add your site URL in Supabase → Authentication → URL Configuration → Site URL.)

## Files

- `index.html` — your landing page, buttons fixed (Sign in / Start Free)
- `signin.html` — sign in / create account (name, email, password)
- `app.html` — dashboard, sidebar, folders, resources, and all 4 generators
- `config.js` — the only file you edit

## ⚠️ One honest warning

The Groq key lives in `config.js`, which the browser can see. For a personal/school project that's fine, but if you share the site publicly, someone could find the key and use your quota. When you're ready to go public, the fix is a Supabase **Edge Function** that holds the key server-side — ask me and I'll build it.
