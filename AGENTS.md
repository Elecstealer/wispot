# Wispot integration guide

## Project overview

Wispot is a React 19 + Vite mobile-web prototype for groups to save places, vote, and build outing routes. The current prototype keeps groups, places, votes, and plans in `src/App.jsx` as local mock data and React state.

## Planned services

### 1. Supabase — application backend

Use Supabase as the primary backend instead of adding a separate application server.

- Postgres: profiles, groups, group members, places, memos, likes, votes, plans, and plan items
- Auth: user sessions and social/email login
- Realtime: group place, vote, and plan updates
- Storage: profile and place images when uploads are added
- Edge Functions: calls to third-party APIs that require a secret, including NAVER Maps REST APIs
- Row Level Security: restrict group data to authenticated members

Browser-safe environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Never expose a Supabase `service_role` key in Vite code or a `VITE_*` variable.

### 2. NAVER Cloud Maps — map and location provider

Use NAVER Maps JavaScript API v3 (`Web Dynamic Map`) to render the interactive map and place markers in the React client.

Browser-safe environment variable:

```env
VITE_NAVER_MAPS_CLIENT_ID=
```

Load the browser SDK with the current `ncpKeyId` query parameter. Register both local and deployed web service URLs in the NAVER Cloud Maps application settings. Enable `Dynamic Map`; add the `geocoder` submodule only when browser-side address conversion is intentionally used.

Use NAVER Maps REST APIs for server-side location operations when needed:

- Geocoding: address to coordinates
- Reverse Geocoding: coordinates to address
- Directions 5/15: driving routes and travel estimates

REST API credentials include a Client Secret and must not be shipped to the browser. Store them as Supabase Edge Function secrets:

```env
NAVER_MAPS_CLIENT_ID=
NAVER_MAPS_CLIENT_SECRET=
```

The React client should call an Edge Function such as `maps-geocode` or `maps-directions`; the function then calls NAVER Cloud Maps with the required authentication headers.

## Initial data model

- `profiles`
- `groups`
- `group_members`
- `places` with `latitude` and `longitude`
- `place_memos`
- `place_likes`
- `votes`
- `vote_candidates`
- `vote_responses`
- `plans`
- `plan_items`

Use UUID primary keys, foreign keys, timestamps, and indexes on group/member lookup columns. Enable RLS on every exposed table.

## Implementation order

1. Create the Supabase project, migrations, RLS policies, and seed data.
2. Add the Supabase JavaScript client and replace local authentication.
3. Move groups and places from React state to Supabase queries.
4. Add `latitude` and `longitude` to places and render them on NAVER Maps.
5. Move votes and plans to Supabase and subscribe to relevant Realtime changes.
6. Add Edge Functions for NAVER geocoding and directions only when those features are required.

## Security rules

- Commit `.env.example` with empty placeholders only; never commit `.env.local` or credentials.
- A `VITE_*` value is public to anyone using the built web app.
- Keep Supabase `service_role`, NAVER Client Secret, and other privileged credentials in server-side secret storage only.
- Do not weaken RLS to work around authorization errors; add explicit member-based policies.
- Validate all Edge Function input and restrict requests to authenticated users where appropriate.

## Agent conventions

- Preserve the existing prototype flow while replacing mock state incrementally.
- Keep external-service clients in focused modules such as `src/lib/supabase.js` and `src/lib/naverMaps.js`.
- Keep database changes as reproducible SQL migrations under `supabase/migrations/`.
- Do not add a custom Node/Express server unless a requirement cannot be handled safely by Supabase, its Edge Functions, or the browser SDK.
