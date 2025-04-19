# QR Registration App

Simple user registration system with QR code generation and validation. Built with React, Supabase, and Tailwind CSS.

## Setup

### 1. Supabase

Create a `users` table in your Supabase project (SQL Editor):

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_select" ON users FOR SELECT USING (true);
```

### 2. Environment

Copy `.env.example` or create `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Usage

- **Register** — enter name + phone, get a unique QR code. You can download the QR image or copy the code.
- **Validate** — paste a code manually or scan a QR with your camera. Shows user details if found.

Duplicate phone numbers are blocked during registration.

## Deploy

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, etc.
