![two:top](frontend/public/social-preview.png)

# two:top

A personal food review app/blog. Users can write and browse reviews of restaurants and cafés, with star ratings, photos, and per-user colour theming.

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | React + Vite + Tailwind CSS v4 + Framer Motion |
| Backend          | Node.js + Express                              |
| Database         | Supabase (Postgres)                            |
| Storage          | Supabase Storage                               |
| Auth             | Auth0                                          |
| Frontend hosting | Cloudflare Pages                               |
| Backend hosting  | Railway                                        |

### Project Structure

twotop/
frontend/ # React app (Cloudflare Pages)
backend/ # Express app (Railway)

## Running the Project Locally

### Backend (Express)

1. Open a terminal and navigate to the backend directory:

```

cd backend

```

2. Install dependencies:

```

npm install

```

3. Create a `.env` file in the backend directory with your environment variables (see `.env.example`).
4. Start the backend server:

```

node index.js

```

Or for automatic restarts during development:

```

npx nodemon index.js

```

5. The backend will run at [http://localhost:3000](http://localhost:3000)

### Frontend (React + Vite)

1. Open a new terminal and navigate to the frontend directory:

```

cd frontend

```

2. Install dependencies:

```

npm install

```

3. Create a `.env` file in the frontend directory with your environment variables (see `.env.example`).
4. Start the development server:

```

npm run dev

```

5. The frontend will run at [http://localhost:5173](http://localhost:5173)
