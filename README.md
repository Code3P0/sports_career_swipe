# sports_career_swipe

Mobile-first “winner-stays” swipe tournament to converge on a sports-business lane.

## Setup

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## How to test tapping works (localStorage)

1. Open `http://localhost:3000` in a mobile-sized viewport.
2. Tap **Start** → you should land on `/play`.
3. Open DevTools → **Console** and tap either choice card:
   - You should see `[runState] initialized` once (first load)
   - Then `[runState] updated` on every tap
4. Open DevTools → **Application** → **Local Storage** → `http://localhost:3000`
5. Confirm the key `sports-career-swipe:run-state:v1` exists and its JSON `history` array grows on each tap.
