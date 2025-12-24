# Beautifier & Interceptor

A rather handy little toolkit for developers who need to make sense of messy code and keep an eye on their API traffic. Built with Next.js, it combines two essential tools into one sleek interface.

## What's It All About?

Ever found yourself staring at a wall of minified JavaScript, wondering what on earth it does? Or perhaps you've needed to document an API but couldn't be bothered to write the spec by hand? This app sorts both of those problems, and then some.

### The Code Beautifier

Pop your minified or obfuscated JavaScript into the left panel, click the sparkly button, and watch it transform into something actually readable. But we didn't stop there — once your code is beautified, you can ask the AI to explain what it does. Quite useful when you're reverse-engineering someone else's work or trying to understand that script you wrote at 3am six months ago.

**How to use it:**
1. Paste your minified JavaScript into the input panel
2. Click **Beautify**
3. Marvel at the nicely formatted output
4. Hit **Explain** if you'd like the AI to walk you through what the code does

### The Traffic Interceptor

This is where things get properly interesting. The Interceptor lets you capture HTTP traffic flowing through your applications, then do clever things with it.

**What you can do:**
- **View Sessions** — See all your captured traffic sessions at a glance
- **Security Scanning** — Run automated scans to spot potential vulnerabilities (the OWASP Top 10 sort of thing)
- **OpenAPI Generation** — Automatically generate API documentation from your captured requests
- **AI Assistant** — Have a chat with Claude about your traffic, ask questions, get insights
- **Saved Insights** — Keep the good bits for later

**Getting started with traffic capture:**
```bash
# Fire up the interceptor in passive mode
interceptor capture --mode passive --port 8888

# Then configure your application to proxy through localhost:8888
```

Once you've captured some traffic, head over to `/interceptor` in the app and you'll see your sessions ready and waiting.

## Setting Things Up

### Prerequisites

You'll need:
- Node.js 18 or newer
- A PostgreSQL database
- About five minutes of your time

### Quick Start

```bash
# Clone it down
git clone https://github.com/creativeprofit22/Beautifier-Interceptor-App.git
cd Beautifier-Interceptor-App

# One command to rule them all
npm run setup
```

The setup script handles dependencies, environment configuration, and database setup. If you prefer doing things manually, read on.

### Manual Setup

```bash
# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Then edit .env with your database credentials and secrets

# Generate the Prisma client
npx prisma generate

# Push the schema to your database
npm run db:push
```

### Environment Variables

Your `.env` file needs a few things:

```bash
# Database connection (required)
DATABASE_URL="postgresql://user:password@localhost:5432/beautifier"

# Auth secret — generate one with: npx auth secret
AUTH_SECRET="your-secret-here"

# GitHub OAuth (for authentication)
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

**Setting up GitHub OAuth:**
1. Head to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy the credentials into your `.env`

### Running the App

```bash
# Development (with Turbopack for speed)
npm run dev

# Production
npm run build && npm start
```

Open [localhost:3000](http://localhost:3000) and you're away.

## Project Structure

```
src/
├── app/                    # Pages and API routes
│   ├── api/               # Backend endpoints
│   └── interceptor/       # Interceptor UI
├── features/              # Feature modules
│   └── interceptor/       # Interceptor components & hooks
├── components/            # Shared UI bits
└── lib/                   # Utilities and helpers
```

## The Tech Stack

- **Next.js 16** with App Router
- **React 19** and **TypeScript**
- **Tailwind CSS v4** for styling
- **Prisma** with PostgreSQL
- **Auth.js** for authentication
- **tRPC** for type-safe APIs

## Available Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Check for linting issues |
| `npm run typecheck` | TypeScript validation |
| `npm test` | Run the test suite |
| `npm run db:studio` | Open Prisma Studio |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/brilliant-idea`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Licence

MIT — do what you like with it.
