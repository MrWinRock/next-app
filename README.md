# Mini Blog (Next.js + Zod)

This is a [Next.js](https://nextjs.org) mini blog demonstrating Users, Posts, and Comments with MongoDB persistence and Zod validation.

## Getting Started

First, set environment variables, install dependencies, and run the development server:

1. Create a `.env.local` in the project root with:

	```dotenv
	MONGODB_URI=mongodb+srv://USER:PASS@HOST/db?retryWrites=true&w=majority
	DB_NAME=next_app
	```

2. Install and run (PowerShell):

	```pwsh
	npm install
	npm run dev
	```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Home (`/`) lists posts and includes forms to create a user and a post. Click a post to see its details and add comments.

Note: The app uses MongoDB via the official Node driver. For local dev you can also point `MONGODB_URI` to a local mongod.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API endpoints

- `GET /api/users` – list users
- `POST /api/users` – create user `{ username, email, password }`
- `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id`
- `GET /api/posts` – list posts
- `POST /api/posts` – create post `{ userId, title, content, likes? }`
- `GET /api/posts/:id`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`
- `GET /api/comments?postId=...` – list comments for a post
- `POST /api/comments` – create comment `{ postId, userId, content }`
- `GET /api/comments/:id`, `PUT /api/comments/:id`, `DELETE /api/comments/:id`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
