# Questions Asked

Interview log for the Instagram-style community app (Clerk + Convex + Expo SDK 57).
🔁 = marked for debate; re-ask next session, and again in 1–2 weeks if still open.

## Round 1 — General requirements (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA1 | General | Platforms / frontend | Expo, iOS + Android |
| QA2 | General | Goal & scale | Small private community |
| QA3 | General | Launch media types | Photos + short video |
| QA4 | Community | How members join | Invite codes/links |
| QA5 | Community | Social graph | Mutual friends |
| QA6 | Community | Privacy within community | All visible to members |
| QA7 | Conflict | What friendship gates (QA5 vs QA6) | Home feed only |
| QA8 | Video | Max length | ≤30s |
| QA9 | Video | Storage/playback | Convex storage first |
| QA10 | Video | Media source | Gallery picker only |
| QA11 | Posts | Items per post | Single, schema carousel-ready |
| QA12 | Feed | Ordering | Newest first |
| QA13 | Posts | Edit/delete/caption features | Edit caption + delete, plain text |
| QA14 | Engagement | Likes/comments | Likes + flat comments |
| QA15 | Engagement | Notifications | In-app + push |
| QA16 | Engagement | Saves/sharing | Neither at launch |
| QA17 | Auth | Sign-in methods | Email code only |
| QA18 | Profile | Profile fields | Username, name, bio, avatar |
| QA19 | Profile | Account deletion | Hard delete everything |
| QA20 | Safety | Roles | Admin + moderator + member |
| QA21 | Safety | Blocking | Full mutual hide |
| QA22 | Safety | Reports | Report → review queue |
| QA23 | Access | Who creates invites | Admins only |
| QA24 | Safety | Mod queue scope | Mods: content reports; admins: all |
| QA25 | Discovery | Finding members | Directory + search |
| QA26 | Scope | DMs | 1:1 text, friends only |
| QA27 | Scope | Stories | Basic stories |
| QA28 | UI | Languages/theme | English, light + dark |
| QA29 | Conflict | Stories audience (vs LL7) | Friends only |
| QA30 | Scope | Phasing | P1 core / P2 Stories / P3 DMs |
| QA31 | Safety | DM reporting | Report message → admin sees context |
| QA32 | Delivery | Distribution | Public App Store + Play |
| QA33 | Ops | Running-cost budget | Free tiers first |
| QA34 | Quality | Testing | Backend tests + UI E2E |
| QA35 | Compliance | Non-invited user / reviewer flow | Invite screen + waitlist |
| QA36 | Legal | Minimum age | 13+ (region half unanswered → QA38) |
| QA37 | Ops | Monitoring | Crash reporting only |
| QA38 | Legal | Member regions | Worldwide |
| QA39 | Legal | Teen safeguards | Teen defaults |
| QA40 | Legal | Age check | Self-declared DOB |
| QA41 | Legal | EU under-consent-age | Country-based age floor |
| QA42 | UX | Offline behavior | Resilient uploads + cached view |
| QA43 | Team | Who builds / timeline | Claude + user, no deadline |
| QA44 | Brand | Name/ID timing | Decide before first build |
| QA45 | Design | Visual direction | Instagram-familiar, own brand |
| QA46 | Legal | Privacy policy/terms | Claude drafts, user reviews, static host |
| QA47 | Brand | Actual name & bundle ID | Name = famfriend (2026-10-05). Bundle ID → QA55. |

## Round 2 — Audience change: extended family only (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA48 | Audience | Youngest member's age | 13 or older |
| QA49 | Delivery | Install channel for family-only (revisits QA32) | Keep public store listing |
| QA50 | Safety | Protection for younger relatives (replaces LL39) | Same as everyone |
| QA51 | Legal | 13–15 relatives in EU countries with consent age 16? | No — keep country floor |
| QA52 | Access | What strangers see (revisits LL35 waitlist) | Invite-only screen, no waitlist |
| QA53 | Roles | Roles for a family (revisits LL20) | Admin + member |

## Round 3 — Identity (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA54 | Brand | Display casing | FamFriend |
| QA55 | Brand | Permanent app ID | com.rahimi.famfriend |

## Round 4 — Phase 1: sign-in & identity (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA56 | Auth | Relatives without email | Email or phone code (⚠ conflicts with LL33 → QA59) |
| QA57 | Profile | Username rules | Instagram-style, change ≤ once / 14 days |
| QA58 | Graph | Friend-request edge cases | Standard (cancel, silent decline, 7-day cooldown, auto-accept crossing) |
| QA59 | Conflict | SMS (paid) vs free tiers | Email only for now |
| QA60 | Onboarding | Join steps order | Invite → email → age → profile → Discover |
| QA61 | Admin | First-admin bootstrap | Owner email env var, one-time |
| QA62 | Notifications | Push-triggering events | Requests, comments, grouped likes, friends' new posts |
| QA63 | Media | Photo resize | 1080px JPEG ~80% + 320px thumb |
| QA64 | Media | Video target | 720p ~2 Mbps |
| QA65 | Media | Upload quotas | Usage alerts, no hard caps |
| QA66 | Conflict | Media traffic vs free tier (LL33) | Accept small overage on Convex |
| QA67 | Profile | Profile screen layout | Instagram header + 3-col grid |
| QA68 | Profile | Friend-list visibility | All members |
| QA69 | Feed | Video autoplay | Muted autoplay on Wi-Fi only |
| QA70 | Admin | Invite UX | Personal single-use link, 7-day expiry, share sheet |
| QA71 | Admin | Remove member | Suspend, then optional hard delete |
| QA72 | Admin | Content takedown | Hide + notify author, purge after 30 days, audit log |
| QA73 | Access | Invite link for non-installed relatives | Web page + code, universal/app links |
| QA74 | Safety | Report reasons | Short family-friendly list |
| QA75 | Safety | Reporter feedback | Thank-you + outcome, anonymous |

## Round 5 — Doc-check conflicts (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA76 | Conflict | Maestro on EAS is paid (LL34 vs LL33) | Run Maestro locally (Android from Windows) |
| QA77 | Conflict | Deep links need own HTTPS domain (LL73) | Buy a cheap domain |

## Round 6 — Dev workflow (2026-10-05)

| # | Topic | Question | Answer |
|---|---|---|---|
| QA78 | Envs | Number of environments | Dev + Prod |
| QA79 | Git | Hosting & branching | Private GitHub, main + feature branches via PR |
| QA80 | CI | Checks per PR | GitHub Actions: lint, types, Convex tests |
| QA81 | Devices | Personal test phones | Android + iPhone |
| QA82 | Accounts | Developer account type | Personal (Apple + Google) |
| QA83 | Domain | Domain to buy | famfriend.app |
