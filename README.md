# kanban

A kanban board made with Next.js. You can try it [here](https://kanban-three-lilac.vercel.app/).

## Setup

This project uses OAuth, so at least one provider is needed (Github or Google). Set the provider's client id and secret in an environment file (see `.env.example`).

Then,
```bash
# Install dependencies
pnpm i

# Run migrations
pnpm prisma migrate dev

# Run dev server
pnpm dev

```
