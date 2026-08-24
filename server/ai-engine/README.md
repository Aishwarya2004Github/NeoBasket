# NeoBasket AI Engine (isolated)

This engine is intentionally separate from the existing NeoBasket server/client. It reads the existing PostgreSQL database through Prisma and does not modify the existing server code or Prisma migrations.

## Features
- AI Shopping Copilot + budget basket + saving + alternatives
- Cheapest/healthy basket optimization
- Personalized recommendations from order history
- Smart refill prediction
- Forgot-something basket suggestions
- Recipe AI / What Can I Cook
- Fridge image scanner (OpenAI vision when API key is configured)
- Intelligent substitutions
- Dynamic pricing preview with ±10% price protection
- Demand forecasting baseline
- Dark-store inventory intelligence
- Expiry-aware discount recommendation
- Delivery ETA prediction
- Admin AI command center
- Socket.IO rider-location events

## Setup
1. Copy `.env.example` to `.env`.
2. Copy DATABASE_URL from `server/.env`.
3. Copy SECRET_KEY_ACCESS_TOKEN into `ACCESS_TOKEN_SECRET`.
4. Optionally add OPENAI_API_KEY.
5. Run `npm install`.
6. Run `npm run prisma:generate`.
7. Run `npm run dev`.

The engine runs on port 8002 by default.

## Existing project integration
- No changes to the existing server are required.
- Copy `client-snippets/AIFeatures.jsx` to `client/src/pages/AIFeatures.jsx`.
- Add the route shown in `client-snippets/route-addition.txt`.
- Add `VITE_AI_ENGINE_URL=http://localhost:8002` to `client/.env.local`.

For authenticated AI calls the frontend sends the existing `accesstoken`. The engine verifies it with the same access-token secret and reads the matching user from the existing database.

## Important
Dynamic pricing is exposed as a safe preview/recommendation API. It does not overwrite the source product price, so the existing checkout remains unchanged. If you later want AI pricing to become the checkout source of truth, add a deliberate backend pricing adapter and audit trail rather than changing the existing price field directly.
