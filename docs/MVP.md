# Sports Business Lane Match (MVP)
Date: 2026-01-01
Owner: You (solo builder)

## One-sentence product
A swipe-first “winner-stays” tournament that converges on the sports-business lane you’d actually enjoy, then gives you a 7-day quest to prove it.

## Target user
College student curious about sports business (often doesn’t know titles; responds to moments, tasks, and proximity).

## Core promise
In under 3 minutes, you get:
- 1 primary lane (with confidence %)
- 1 runner-up lane
- 3 “north star” figures (ecosystem matches, not personality matches)
- a 7-day validation quest (real artifacts)

## MVP lanes (8)
1) Partnerships / Sponsorships (sell + package + renew)
2) Media / Content Strategy (formats + distribution + programming)
3) Community / Membership / Events (people + programming + ops)
4) Growth / Ticketing / CRM (funnels + pricing + retention)
5) NIL / College Athletics Ops (rules + relationships + execution)
6) Talent / Creator Partnerships (talent alignment + deal terms + rollout)
7) BizOps / Strategy (problem framing + operating cadence + cross-functional)
8) Product / Fan Experience (features + user research + shipping)

## Interaction model (non-negotiable)
- One question at a time.
- Tournament format: “winner stays” (ELO-style pairwise choices).
- 12–18 rounds max.
- Every round is a binary choice between two cards.
- User taps left/right (or swipes).
- Micro-feedback every ~5 rounds: “Narrowing: X vs Y”.

## Card types (MVP = 2 types)
A) lane_scenario
- A concrete moment or task.
- Example: “Sponsor is about to churn. Do you renegotiate or redesign the activation?”

B) figure_shadow
- “Shadow this person for a day” vignette.
- Not celebrity worship. It’s a proxy for ecosystem/workstyle.

## Matching logic (simple + deterministic)
- Maintain an ELO rating per lane (start all at 1200).
- Each matchup implicitly pits lane A vs lane B based on card tags.
- When user picks a card, winner lane’s rating goes up; loser’s goes down.
- Stop when:
  - rounds == 16, OR
  - top lane lead >= 120 rating over #2 after at least 10 rounds.

## Output screen (must be screenshotable)
- Primary lane + confidence %
- Runner-up lane + confidence %
- “Why you matched” (3 bullets tied to actual choices)
- Top 3 north-star figures (each with 1-line “what you’re drawn to”)
- 7-day quest: 3 artifacts + 2 outreach actions + 1 reflection check

## 7-day quest template (always included)
Artifacts (choose 3):
- 1-page teardown (sponsor, media series, event, or growth funnel)
- 5-slide mini deck (package, format plan, or experiment plan)
- 400–700 word memo (what you’d do + why + expected result)

Outreach (choose 2):
- DM/email script to 2 people in the lane (ask for 15 min + include artifact)

Reflection (1):
- “Did I want to keep going when it got hard?” (yes/no + 2 sentences)

## MVP constraints
- No login.
- Store progress locally (localStorage).
- Start with a hardcoded JSON card bank.
- Ship on a URL (Vercel or similar).

## V2 upgrades (not MVP)
- Accounts + saved runs
- Personalization from campus/region
- Social share cards
- More lanes + better figure set
- A/B tests on card wording and convergence speed
