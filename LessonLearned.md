# Lessons Learned

What was agreed in each interview batch. ⚠ = deviation from market norm, conflict, or added risk.

## Round 1 — General requirements (2026-10-05)

### Platform & media
- LL1 — Frontend = existing Expo SDK 57 project (Expo Router), iOS + Android only.
- LL2 — Small private community (tens–hundreds of known users).
- LL3 — Photos + short video at launch. ⚠ Highest-complexity choice; market MVPs usually start photo-only.

### Community model
- LL4 — Membership via invite codes/links; Clerk sign-up requires a valid invite.
- LL5 — Mutual-friends graph (request/accept). ⚠ Deviates from Instagram's one-way follow.
- LL6 — All profiles/posts visible to every member (exceptions: LL21 blocks, LL29 stories).
- LL7 — Conflict LL5↔LL6 resolved: friendship only scopes the home feed; Discover tab prevents an empty feed for new members.

### Video pipeline
- LL8 — Video ≤30s, compressed on device.
- LL9 — Media stored/served from Convex file storage; on-device thumbnails; Mux only if playback suffers.
- LL10 — System gallery picker only; no in-app camera/filters.

### Posts & feed
- LL11 — One media item per post; `media` stored as array (carousel-ready, no future migration).
- LL12 — Home feed = friends' posts, newest first, paginated.
- LL13 — Media immutable; caption editable; post deletable (incl. files). Plain-text captions.

### Engagement
- LL14 — Likes (count + likers) + flat comments; author deletes own, post owner deletes any on their post.
- LL15 — In-app activity feed with live badge + push (expo-notifications) → development build required.
- LL16 — No saves or sharing at launch.

### Auth & profile
- LL17 — Clerk email-code sign-in only (no OAuth → no Sign in with Apple requirement).
- LL18 — Profile: unique changeable @username, display name, bio, avatar; Convex `users` synced from Clerk via webhook; onboarding picks username.
- LL19 — Account deletion = hard delete all user data via Convex background cleanup.

### Safety & roles
- LL20 — Roles: admin / moderator / member. ⚠ One tier more than recommended.
- LL21 — Block = mutual hide + auto-unfriend + no interaction.
- LL22 — Reports (post/comment/user + reason) → in-app queue; dismiss / remove content / remove member. No auto-hide, no AI scanning.
- LL23 — Invites: admins only; single/multi-use, expiring, revocable.
- LL24 — Moderators handle post/comment reports; admins see all and remove members.
- LL25 — Discover: member directory + recent posts + search (Convex search index).

### Scope extras & UI
- LL26 — 1:1 text DMs between friends. ⚠ Deviates from recommendation; +25–35% scope.
- LL27 — Basic Stories (photo/≤30s video, 24h expiry). ⚠ +~20% scope.
- LL28 — English only; light + dark following system; strings centralized.
- LL29 — Stories visible to friends only: deliberate exception to LL7.
- LL30 — Phases. P1: auth + invites + waitlist, profiles, friends, posts, feed, likes/comments, Discover, block/report, roles, push. P2: Stories. P3: DMs. Schema designed for all phases upfront.
- LL31 — DM reports send only the reported message + small context to admin-only queue.

### Delivery & operations
- LL32 — Public App Store + Play listing. ⚠ Tension with invite-only model → review risk, mitigated by LL35.
- LL33 — Free tiers first, with usage alerts; video limits protect quotas.
- LL34 — Convex function tests (permissions focus) + strict TS + lint + UI E2E (e.g. Maestro). ⚠ Above recommendation.
- LL35 — Welcome screen: enter invite or join waitlist; reviewers get a demo account.
- LL37 — Crash reporting only (e.g. Sentry); no product analytics.

### Age & legal
- LL36 — Minimum age 13+. ⚠ Deviates from 18+ recommendation; raises store/legal obligations.
- LL38 — Worldwide members → design to strictest regime (EU GDPR/DSA, UK Children's Code).
- LL39 — Teen defaults for <18: DMs friends-only, no adult friend requests unless mutual friends/admin-allowed, minor reports prioritized.
- LL40 — Self-declared DOB stored privately; <13 blocked; <18 flagged.
- LL41 — Sign-up collects country + DOB; per-country consent-age floor (13–16). No parental-consent flow.
- LL46 — Claude drafts privacy policy + terms; user reviews (lawyer advised); static hosting.

### UX, team & brand
- LL42 — Resilient uploads (progress/retry), cached recent feed, offline banner.
- LL43 — Claude codes in small reviewable steps; user reviews/learns; no deadline.
- LL44 — Name/bundle ID must be fixed before first EAS build/push/Clerk config (pending QA47).
- LL45 — Instagram-familiar layout, own brand; design tokens for light/dark.

## Round 2 — Audience change (2026-10-05)
- LL47 — Audience narrowed: ONLY extended family members may sign up; includes some younger members. Replaces LL2 ("small private community"). ⚠ Re-opens: LL32 (public listing), LL35 (waitlist), LL36/LL40/LL41 (age floor), LL39 (teen defaults block adult friend requests — conflicts with adult relatives), LL17 (young kids may lack email), LL20 (3 roles may be overkill). Resolving via QA48–QA50.

- LL48 — Youngest member is 13+. LL36/LL40 stand (DOB at sign-up, <13 blocked). No under-13 or parent-managed accounts.
- LL49 — Keep public App Store + Play listing despite family-only audience (LL32 confirmed). ⚠ Market norm for a family-only app is private beta / unlisted distribution; accepted cost = full store review, age rating, public privacy policy, stranger-facing welcome screen (LL35). Waitlist purpose now unclear → QA52.
- LL50 — No special minor safeguards: all members treated equally. **Supersedes LL39.** ⚠ Below industry practice for a public-listed app with 13+ users; relies on family trust + block/report (LL21/LL22). ⚠ Interaction with LL41: a country-based consent floor may still BLOCK younger relatives in some EU countries (e.g. 14–15-year-olds) since there is no parental-consent flow → QA51.

- LL51 — No 13–15-year-old relatives in EU countries with a consent age above their age. LL41 (country-based floor, no parental consent) stands. Conflict LL50↔LL41 resolved; if such a relative appears later, they are blocked until a consent step is added.
- LL52 — Strangers see an invite-only screen ("private family app — ask a family admin"), invite code field, no waitlist. Reviewers get demo account. **Supersedes waitlist part of LL35**; no stranger personal data collected.
- LL53 — Roles: admin + member only (you + 1–2 trusted relatives as admins). **Supersedes LL20**; **LL24 split queue removed** — admins handle all reports.

### Round 2 net effect on scope
Removed: waitlist, moderator tier, split report queue, teen safeguards. Kept: public listing (with review cost), DOB + country floor, block/report.

## Round 3 — Identity (2026-10-05)
- LL54 — App name = **famfriend** (QA47 partially resolved). Web search found no exact "FamFriend" app, but similar names exist ("Fam – make new friends live" on App Store; "Family Friend" at familyfriend.app) → mild confusion risk. Store name uniqueness is only confirmed when reserving the name in App Store Connect / Play Console. Display casing + bundle ID still open → QA54/QA55. No config files changed yet (`app.json` still "FirstApp").

- LL55 — Display name **FamFriend**; app ID **com.rahimi.famfriend** (iOS bundle ID + Android package). Permanent after first store release. **QA47 fully resolved; LL44 satisfied.** To apply in `app.json` (name, slug, scheme, ios.bundleIdentifier, android.package) only when we start coding — before any EAS build, Clerk redirect or push credential setup.

## Round 4 — Phase 1: sign-in & identity (2026-10-05)
- LL56 — Sign-in by email OR phone (SMS) code, for relatives without email. ⚠ **CONFLICT with LL33 (free tiers first)**: per clerk.com/pricing (checked 2026-10-05), SMS codes are NOT available on the free Hobby plan; require Pro ($25/mo, $20/mo annual) + $0.01/SMS US/CA, market rate international. → QA59.
- LL59 — Conflict LL56↔LL33 resolved: **email code only** at launch (free). LL56 superseded; LL17 stands. Relatives without email create one or use a family-shared email. SMS can be enabled later via Clerk Pro + phone field (no rewrite).
- LL57 — Usernames: 3–30 chars, lowercase letters/digits/`.`/`_`, case-insensitive unique, reserved words blocked (admin, famfriend, support…), change max once per 14 days.
- LL58 — Friend requests: sender can cancel; decline is silent (sender keeps seeing "Requested"); 7-day cooldown after decline; unfriend silent, removes from both feeds; crossing requests auto-accept.
- LL60 — Onboarding: invite validated → email + code (Clerk) → DOB + country (block if under country floor) → username, display name, optional avatar → land on Discover with "Find your family" prompt. ⚠ Correction to my earlier wording: at step 3 the Clerk account (with email) already exists, so a blocked minor's Clerk user + invite claim must be **deleted immediately** (server-side) — otherwise their email stays stored.
- LL61 — First admin: owner email in a Convex env variable per environment; first sign-in with that email becomes admin; path disabled once an admin exists.
- LL62 — Push for: friend request received/accepted, comment on your post, likes on your post (batched/grouped), new post from a friend. Everything also appears in in-app activity.
- LL63 — Photos resized on device: longest side 1080px, JPEG ~80% (~200–500 KB) + 320px thumbnail for grids.
- LL64 — Video compressed on device to 720p ~2 Mbps (~7–8 MB per 30s clip).
- LL65 — Usage alerts to admins at 70%/90% of Convex free-tier limits; no per-member hard caps.
- ⚠ **Convex free tier (convex.dev/pricing, checked 2026-10-05): 1 GB file storage, 1 GB data egress, 0.5 GB DB storage, 1M function calls, 1 GB DB I/O.** Beyond that = pay-as-you-go (storage $0.033/GB, egress $0.132/GB). Rough math: ~130 videos fill storage; one video watched by 20 relatives ≈ 150 MB egress → 1 GB egress ≈ 6–7 videos viewed per month. **LL3 + LL9 + LL64 conflict with LL33 (free tiers)** → QA66.
- LL66 — Conflict resolved: stay on Convex for all media (LL9), keep 720p/1080px, accept small usage-based overage (est. a few $/month). **LL33 updated → "free tiers first; small usage-based overage OK; monitored by LL65 alerts".** To verify before launch: whether Convex's no-card Free plan pauses at limits (vs Starter pay-as-you-go needing a card on file).

### Phase 1: profile & feed
- LL67 — Profile: header (avatar, display name, @username, bio, post count, friend count, Add/Requested/Friends button) + 3-column grid of 320px thumbnails (play icon on videos); tap opens post.
- LL68 — Friend lists visible to all members (consistent with LL6; blocked pairs excepted per LL21).
- LL69 — Feed video: autoplay muted only on Wi-Fi when on screen; tap for sound; on cellular show thumbnail, play on tap. Needs network-type detection (verify SDK 57 option, e.g. expo-network).

### Phase 1: admin tools
- LL70 — Invites: admin enters relative's name (optional email) → single-use link, 7-day expiry, shared via OS share sheet; status list (pending/used/expired/revoked). **Supersedes multi-use part of LL23.** ⚠ Invite links need to open the app OR send non-installed relatives to the store → requires deep/universal links (a domain) → QA73.
- LL71 — Remove member = suspend (signed out, can't sign in, content hidden); admin can restore or hard-delete (LL19).
- LL72 — Content takedown: hidden for all, author notified with reason, purged after 30 days unless restored; audit log of admin actions. Note: an account deletion (LL19) also purges that member's hidden content immediately.
- LL73 — Invite links point to a free static web page (same host as privacy policy, LL46): store buttons + invite code; opens app directly when installed via iOS universal links / Android app links. Open: which free host/subdomain (must serve `.well-known` verification files) → decide in dev-workflow round. Verify against Expo SDK 57 linking docs.
- LL74 — Report reasons: Hurtful or bullying · Inappropriate content · Privacy (shared without permission) · Spam or fake account · Something else (free text).
- LL75 — Reporter gets immediate thank-you + in-app outcome notice when resolved; reporter stays anonymous to the reported member.
- Verified: Clerk "Require invitations" IS on the free Hobby plan → LL4 works on free tier. Allowlist/blocklist is Pro-only (not needed; we use invitations).

## Round 5 — Doc checks (2026-10-05)
- LL76 — **Convex Free plan = hard caps** ("new mutations … may fail" once limits hit; docs.convex.dev/production/state/limits). LL66's overage only works on the **Starter plan: $0/month base, pay-as-you-go** (same 1 GB storage / 1 GB egress included). Card on file likely needed (not stated on page). → Project must be on Convex Starter before family video use. HTTP action response limit 20 MiB; no stated request-size limit (uploads use upload URLs).
- LL77 — **Maestro E2E on EAS Workflows is NOT on the free EAS plan** (expo.dev/pricing: "$0.05, plus CI/CD minute usage", Starter plan and up). Free EAS: 15 Android + 15 iOS builds/month, ≤60 CI/CD minutes. ⚠ Conflict LL34 (UI E2E) ↔ LL33 (free tiers) → QA76.
- LL78 — **Universal links / App Links need an HTTPS domain you control** serving `/.well-known/apple-app-site-association` (≤128 KB, valid JSON) and `/.well-known/assetlinks.json` (`application/json`, SHA-256 cert fingerprints). Expo docs don't cover free subdomains. Config: `ios.associatedDomains` (`applinks:<domain>`, no https://), `android.intentFilters` with `autoVerify`. ⚠ LL73 assumed a free host → QA77.
- LL79 — Clerk: `@clerk/expo` confirmed (`ClerkProvider` from `@clerk/expo`, token cache from `@clerk/expo/token-cache`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`; peers `expo-secure-store expo-auth-session expo-crypto expo-web-browser` installed via `npx expo install`). Custom email-code flow uses `signUp.verifications.sendEmailCode()` / `verifyEmailCode({ code })`. Custom flows work in Expo Go.
- LL80 — Convex + Clerk: Clerk dashboard "Convex integration" → `npx convex env set CLERK_FRONTEND_API_URL <fapi_url>` → `convex/auth.config.ts` with `domain: process.env.CLERK_FRONTEND_API_URL`, `applicationID: 'convex'` → `ConvexProviderWithClerk` from `convex/react-clerk` inside `ClerkProvider`. Convex URL env: `EXPO_PUBLIC_CONVEX_URL`. ⚠ Neither Convex nor Clerk publishes an Expo-specific combined guide (docs cover React/Next.js/TanStack) → pairing with `useAuth` from `@clerk/expo` to be proven in a small first spike.
- LL81 — Video compression: `react-native-compressor` 2.0.3 — Expo config plugin, development build (not Expo Go), New Architecture supported; options `compressionMethod`, `maxSize` (default 640 → we set 1280 for 720p), `bitrate`. ⚠ npm lists peer `react-native-nitro-modules >=0.35` though README doesn't → confirm at install. Photos: `expo-image-manipulator` 57.0.20.
- LL82 — Wi-Fi detection: `expo-network` 57.0.2 — `useNetworkState()` / `NetworkStateType.WIFI|CELLULAR`; works in Expo Go, no config plugin.

- LL83 — Conflict LL34↔LL33 resolved: **Maestro runs locally** (free, open-source CLI; needs Java 17+ with `JAVA_HOME`). User's machine is Windows → **local E2E covers Android only**; iOS local testing needs macOS + Xcode (or paid Maestro Cloud / EAS). iOS checked via manual checklist on a real device. LL34 updated accordingly.
- LL84 — **Buy a cheap domain** (e.g. famfriend.app — availability/price to check; est. ~$10–20/yr) on a free static host. Serves: invite landing page (LL73), `.well-known` AASA + assetlinks files (LL78), privacy policy + terms (LL46). LL33 updated: domain is an accepted small yearly cost.

## Round 6 — Dev workflow (2026-10-05)
- Repo state: no git remote; only local `master`; `example/` is git-ignored (template code not committed).
- LL85 — Two environments: **Dev** (Convex dev deployment, Clerk development instance, app "FamFriend (Dev)" with ID `com.rahimi.famfriend.dev` installable side by side) and **Prod** (Convex prod deployment, Clerk production instance, store app `com.rahimi.famfriend`). Implies dynamic `app.config.ts` keyed on an env variable, and separate push credentials per variant.
- LL86 — Private GitHub repo; rename `master` → `main`; short-lived feature branches; merge via PR after user review.
- LL87 — GitHub Actions on every PR: `npx expo lint`, `npx tsc --noEmit`, Convex function tests. Maestro stays local (LL83). Verified: GitHub Free = 2,000 free Actions minutes/month for private repos (Linux 2-core is the baseline runner) — ample.
- Verified (convex-test docs): `convex-test` + `vitest` + `@edge-runtime/vm`, `environment: "edge-runtime"`, `t.withIdentity()` for auth. ⚠ Limitations: **file storage not mocked**, scheduled functions need fake timers, text search simplified → media cleanup (LL19/LL72) needs dev-deployment checks beyond unit tests.
- Verified (Apple): Developer Program **$99/year**. Free on-device provisioning only via Xcode (macOS). ⚠ User is on **Windows** → installing dev builds on an iPhone via EAS requires the paid program.
- Verified (Google Play): **$25 one-time** fee. ⚠ New personal accounts must run a **closed test with ≥12 testers opted in continuously for ≥14 days** before production access, and verify access to an Android device. Family members can serve as these testers.
- Verified: **Clerk production instance requires a domain you own** + DNS records (propagation up to 48h; CAA must allow LetsEncrypt or Google Trust Services). → LL84 domain is now **mandatory**, not optional, and should be bought early.

- LL88 — User has **Android + iPhone**. Order: build/test on Android first (free from Windows via EAS dev builds); enroll in Apple Developer Program ($99/yr) when iOS device testing starts. Local Maestro on Android (LL83).
- LL89 — **Personal** Apple + Google developer accounts (user's legal name shown as developer). Google's 12-testers × 14-days closed test applies → plan Phase 1 family beta to satisfy it before public Play release.
- LL90 — Domain: **famfriend.app**. Registry RDAP lookup (2026-10-05) returned 404 (no registration record) for both famfriend.app and famfriend.com → appear unregistered. Final availability + price (incl. possible premium pricing) confirmed only at a registrar; buy early (needed for Clerk prod DNS, LL87; app links, LL78; privacy policy, LL46).

## Open flags
- Scope ≫ "simple": mitigated by phasing (LL30).
- ~~QA47 name/bundle ID — DEBATE~~ → resolved (LL55).
- Sign-in for younger relatives without email (LL17) — raise first next round.

## Version check (npm registry, 2026-10-05)
- convex 1.46.0 · @clerk/expo 4.8.1 (peer expo >=54 <58 ✓)
- ⚠ `@clerk/clerk-expo` is DEPRECATED → use `@clerk/expo` (Clerk Core 3).
- expo-video 57.0.5 · expo-video-thumbnails 57.0.2 · expo-notifications 57.0.21 · expo-image-picker 57.0.20 · @sentry/react-native 8.29.0
- ~~To verify before planning: video compression lib, Maestro on EAS, Convex + Clerk guide~~ → done in Round 5 (LL76–LL82).
- expo-network 57.0.2 · expo-image-manipulator 57.0.20 · react-native-compressor 2.0.3

## Next interview rounds (proposed)
1. Phase-1 detail: friend-request edge cases, notification types, username rules, profile grid behavior.
2. Admin tooling: waitlist handling, invite UX, moderation audit log, first-admin bootstrap.
3. Media limits: photo resolution/size caps, video bitrate, storage quota alerts.
4. Dev workflow: environments (dev/prod Convex + Clerk instances), branching, CI.
