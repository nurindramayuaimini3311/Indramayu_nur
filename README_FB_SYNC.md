# Alwi Facebook Sync (server)

This branch adds a minimal Node/Express server that proxies Facebook Graph API calls and provides a simple sync endpoint to convert comments into Alwi story entries.

Important: DO NOT commit your Facebook access token. Add it to environment variables as described below.

Files added
- server/index.js           -- express app entry
- server/facebook.js        -- GET /api/facebook/comments?object_id=...
- server/sync.js            -- POST /api/sync/facebook?object_id=... (requires ALWI_SYNC_SECRET if set)
- server/package.json       -- dependencies and start script
- data/alwi_history.json    -- sample history file
- examples/komentar_fb.html -- simple client example to list comments via server

Environment variables (.env)
- FB_APP_TOKEN=your_facebook_app_or_page_token
- ALWI_SYNC_SECRET=some-secret-for-protecting-write-endpoint (optional but recommended)
- PORT=3000 (optional)
- FB_CACHE_TTL=30 (cache ttl seconds, optional)

Run locally
1. cd server
2. npm install
3. create a `.env` file with the variables above
4. npm start

How it works
- GET /api/facebook/comments?object_id={POST_OR_PAGE_ID}
  - Proxies the Graph API request to fetch comments for a post or object. Results are cached for FB_CACHE_TTL seconds.

- POST /api/sync/facebook?object_id={POST_OR_PAGE_ID}
  - Fetches comments from Graph API and appends new comment-based entries into `data/alwi_history.json`.
  - If `ALWI_SYNC_SECRET` is set, include it in the request as header `X-Sync-Secret` or as query param `?secret=...`.

Client examples
- examples/komentar_fb.html shows how to query the server for comments and render them.

Next steps you can do
- Deploy server to a Node-capable host (Render, Heroku, VPS, etc.) and set environment variables there.
- (Optional) Add a scheduled job to call POST /api/sync/facebook periodically, or use the admin sync endpoint from a protected admin UI.
- (Optional) Add moderation workflow: write new entries to a pending file instead of directly to `alwi_history.json`.
