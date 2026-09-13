# Friend Audio Backend

Production-oriented Node.js/TypeScript backend for the Friend Audio Flutter API contract.

## Architecture

`Route -> middleware -> controller -> service -> repository -> MongoDB`. REST and WebSocket paths share service-layer business rules.

## Security model

Friendship **never** grants audio access by itself. A listener must be authenticated, be friends with the owner, have explicit owner-to-listener permission, and the owner must be online and available. Authorization is checked again when the owner accepts.

## Install

```bash
cp .env.example .env
npm install
npm run dev
```

MongoDB must be running at `MONGODB_URI`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm start`
- `npm run seed`
- `npm test`
- `npm run lint`

## API

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/users/me`
- GET `/users/search?q=sarah`
- GET `/friends`
- GET `/friends/requests`
- POST `/friends/requests`
- POST `/friends/requests/:id/accept`
- POST `/friends/requests/:id/reject`
- DELETE `/friends/:userId`
- GET `/audio/permissions`
- PUT `/audio/permissions`
- POST `/audio/sessions`
- GET `/audio/sessions/active`
- PATCH `/audio/sessions/:id`
- POST `/audio/sessions/:id/stop`
- GET `/audio/ice-servers`
- GET `/health`

`API_PREFIX` can be set to `/api/v1` or left empty for exact Flutter-compatible paths.

## WebSocket

Connect using `ws://host:port/ws?token=<JWT>`.

Events use:

```json
{ "type": "audio.offer", "sessionId": "...", "payload": {} }
```

Supported signaling: `audio.offer`, `audio.answer`, `audio.ice_candidate`, and `audio.session.started`. The server authenticates sockets, validates session membership/state, and relays SDP/ICE without storing media.

## Seed data

`npm run seed` creates Sarah, Ashish, John, and Emma. Password: `password123`.

## Example

```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/auth/register -H 'Content-Type: application/json' -d '{"username":"sarah","email":"sarah@example.com","password":"password123"}'
```

## Production notes

Use strong secrets, TLS, restricted CORS, a managed MongoDB deployment, process supervision, external TURN infrastructure, monitoring, and additional integration tests. Never expose TURN credentials unless explicitly configured.
