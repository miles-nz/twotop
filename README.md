# MIMU

A personal food review app/blog for a small group of users. Users can write and browse reviews of restaurants and cafés, with star ratings, photos, and per-user colour theming.

## Features

- Write reviews with restaurant name, visit date, food/drink/ambience star ratings, notes, and up to 5 photos
- Public reviews visible to anyone, private reviews visible only to logged-in users
- Per-user colour theming: each reviewer has their own colour scheme
- Image carousel with swipe support on mobile
- Swipeable star ratings on mobile
- Collapsible review form, auto-opens if no reviews exist
- Delete your own reviews
- Responsive design, optimised for mobile and desktop

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | React + Vite + Tailwind CSS v4 + Framer Motion |
| Backend          | Node.js + Express                              |
| Database         | Supabase (Postgres)                            |
| Storage          | Supabase Storage                               |
| Auth             | Auth0                                          |
| Frontend hosting | Vercel                                         |
| Backend hosting  | Railway                                        |

### Project Structure

```
mimu/
  frontend/   # React app (Vercel)
  backend/    # Express app (Railway)
```
