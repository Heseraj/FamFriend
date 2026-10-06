# FamFriend — Project Plan

Status: **APPROVED** (2026-10-05). Work proceeds milestone by milestone; the user runs all git commands (stage/commit/branch/push) personally.
Source of truth for decisions: `LessonLearned.md` (LL#) and `Questions Asked.md` (QA#). This plan cites LL numbers instead of repeating rationale.

---

## 1. What we're building

**FamFriend** is a private, Instagram-style app for your extended family (LL47, LL55).
- Members join only by an admin's invite (LL4, LL70); age 13+ with a per-country minimum (LL48, LL41).
- Members share photos and ≤30s videos (LL3, LL8), become mutual friends (LL5), and see friends' posts newest-first in their home feed (LL7, LL12). Any member can view any profile (LL6), except between blocked pairs (LL21).
- Likes, flat comments, an activity feed and push notifications (LL14, LL15, LL62).
- Two roles: admin and member (LL53). Admins handle invites, reports, takedowns and member removal (LL70–LL72).
- Published on the App Store and Google Play, but only invited relatives can get in (LL49, LL52).

### Phases (LL30)
| Phase | Scope |
|---|---|
| **1 — Core** | Auth + invites, onboarding, profiles, friends, Discover + search, photo/video posts, feed, likes, comments, activity + push, block/report, admin tools, account deletion |
| **2 — Stories** | 24h photo/video stories, friends-only (LL27, LL29) |
| **3 — DMs** | 1:1 text DMs between friends, message reporting (LL26, LL31) |

The database schema is designed for all three phases in Phase 1, so Phases 2–3 add tables and screens without changing existing ones (LL11, LL30).

---

## 2. Stack & versions (verified 2026-10-05)

| Concern | Choice | Version / note |
|---|---|---|
| App framework | Expo + Expo Router (existing project) | expo ~57.0.26, react-native 0.86.3, react 19.2.3 |
| Auth | Clerk | `@clerk/expo` 4.8.1 — **not** the deprecated `@clerk/clerk-expo` (LL79) |
| Backend / DB / files | Convex | `convex` 1.46.0, **Starter plan** (pay-as-you-go) before family video use (LL76) |
| Photo resize | `expo-image-manipulator` | 57.0.20 |
| Video compression | `react-native-compressor` | 2.0.3, needs a development build; confirm `react-native-nitro-modules` peer at install (LL81) |
| Video thumbnails / playback | `expo-video-thumbnails` / `expo-video` | 57.0.2 / 57.0.5 |
| Media picker | `expo-image-picker` | 57.0.20 |
| Images | `expo-image` (disk cache) | already installed |
| Network type | `expo-network` | 57.0.2, `useNetworkState()` (LL82) |
| Push | `expo-notifications` | 57.0.21 |
| Crash reporting | `@sentry/react-native` | 8.29.0 — free tier and SDK 57 setup still to confirm |
| Backend tests | `convex-test` + `vitest` + `@edge-runtime/vm` | file storage is not mocked (LL87 note) |
| UI E2E | Maestro CLI, run locally on Android | Java 17+ (LL83) |
| CI | GitHub Actions | lint, typecheck, Convex tests (LL87) |
| Builds | EAS Build (free: 15 iOS + 15 Android/month) | |

Rules (AGENTS.md): install packages with `npx expo install`; run `npx expo lint` and `npx tsc --noEmit` before calling any step done; check the SDK 57 docs before using an Expo API.

---

## 3. Architecture

```
Expo app (iOS/Android)
 ├─ ClerkProvider (@clerk/expo, email-code custom flow)
 │   └─ ConvexProviderWithClerk (convex/react-clerk)
 │        └─ Expo Router screens
 │
 ├─ Media: picker → resize/compress → thumbnail → Convex upload URL
 └─ expo-notifications token → Convex

Convex (dev + prod deployments)
 ├─ queries/mutations: all permission checks server-side
 ├─ actions: Clerk Backend API (delete users), Expo push sends
 ├─ HTTP action: Clerk webhook (user sync), verified signature
 ├─ scheduler/crons: like-grouping, 30-day purge, invite expiry, usage checks
 └─ file storage: photos, thumbnails, videos, avatars

Static site on famfriend.app (free host)
 ├─ /invite/<code> landing page (store buttons + code)
 ├─ /.well-known/apple-app-site-association, /.well-known/assetlinks.json
 └─ /privacy, /terms
```

### Key design rules
1. **Every permission check runs on the server**, in Convex functions. That includes: signed in, `status === active`, role, blocked pair and ownership. The client only hides buttons.
2. **One helper module** (`convex/lib/auth.ts`) provides `requireMember`, `requireAdmin` and `assertNotBlocked`. Every function uses it, which makes privacy rules testable in one place.
3. **Home feed uses fan-out on write.** Posting inserts a `feedItems` row for each friend, so pagination is a simple index read. That works at family scale (tens to hundreds of members). Unfriending and blocking remove the affected rows (LL58, LL21).
4. **Counts are stored on the parent record**, e.g. `likeCount` and `commentCount` on posts, so the feed doesn't count rows.
5. **Dev and prod app variants** come from `app.config.ts`, keyed on `APP_VARIANT`:
   - Dev: "FamFriend (Dev)", `com.rahimi.famfriend.dev`
   - Prod: "FamFriend", `com.rahimi.famfriend` (LL85)

---

## 4. Data model (all phases)

`→` = index. Status fields allow soft states (hidden, suspended) before hard deletion.

| Table | Key fields | Phase |
|---|---|---|
| `users` | clerkId, username, usernameLower, displayName, bio, avatarStorageId, role (`admin`/`member`), status (`onboarding`/`active`/`suspended`/`deleting`), birthDate, country, usernameChangedAt · → clerkId, usernameLower · search on displayName + username | 1 |
| `invites` | code, inviteeName, inviteeEmail?, createdBy, status (`pending`/`used`/`expired`/`revoked`), expiresAt, usedBy · → code, status | 1 |
| `friendRequests` | fromId, toId, status (`pending`/`accepted`/`declined`/`cancelled`), respondedAt · → (toId,status), (fromId,toId) | 1 |
| `friendships` | userA, userB (ordered pair) · → userA, userB, pair | 1 |
| `blocks` | blockerId, blockedId · → both directions | 1 |
| `posts` | authorId, caption, media[] {kind, storageId, thumbStorageId, width, height, durationMs?, bytes}, status (`visible`/`hidden`), hiddenReason?, hiddenAt?, likeCount, commentCount, editedAt? · → (authorId, creation time) | 1 |
| `feedItems` | ownerId, postId, authorId, postCreatedAt · → (ownerId, postCreatedAt) | 1 |
| `likes` | postId, userId · → (postId,userId), userId | 1 |
| `comments` | postId, authorId, body, status · → (postId, creation time) | 1 |
| `notifications` | recipientId, type, actorIds[], postId?, groupKey, read, updatedAt · → (recipientId, updatedAt), groupKey | 1 |
| `pushTokens` | userId, token, platform · → userId, token | 1 |
| `reports` | reporterId, targetType (`post`/`comment`/`user`/`message`), targetId, reason, details?, status, resolution?, resolvedBy?, contextSnapshot? · → status | 1 (message: 3) |
| `auditLog` | actorId, action, targetType, targetId, reason? | 1 |
| `mediaUsage` | totalBytes (single counter doc) for storage alerts | 1 |
| `stories` | authorId, media {…}, expiresAt · → (authorId, expiresAt) | 2 |
| `conversations` / `messages` | participant pair; conversationId, senderId, body, status | 3 |

Blocked minors (LL60) never get a `users` row past `onboarding`; their Clerk user is deleted immediately.

---

## 5. Phase 1 — milestones

Each milestone = one or a few small PRs you review and merge (LL43, LL86). Each one ends with lint + typecheck + tests green and a short manual check on Android.

### M0 · Housekeeping
- Private GitHub repo; rename `master` → `main`; commit the template removal; decide whether `example/` stays ignored or is deleted.
- `app.config.ts` with dev/prod variants (LL85); name, scheme `famfriend`, bundle IDs (LL55).
- GitHub Actions workflow: lint, `tsc --noEmit`, vitest (LL87).
- **Check:** CI passes on the first PR.

### M1 · Spike: Clerk + Convex in Expo (LL80)
- Install `@clerk/expo` + peers and `convex`. Create the Convex dev deployment, and a Clerk dev instance with its Convex integration.
- Email-code sign-in (custom flow) → `ConvexProviderWithClerk` → a `whoami` query returns the Clerk identity.
- **Also prove the invite mechanism** (open question O1).
- First EAS **development build** on your Android phone (needed for the compressor and push later).
- **Check:** sign in on the phone, and see your identity returned from Convex.

### M2 · Schema, user sync, admin bootstrap, test harness
- Full schema (section 4). Clerk webhook → HTTP action → `users` upsert/delete, with the signature checked.
- First-admin bootstrap from the `OWNER_EMAIL` env var, one-time (LL61).
- `convex/lib/auth.ts` helpers, plus `convex-test` setup with identity mocking.
- **Check:** unit tests for the helpers (suspended user rejected, non-admin rejected, blocked pair rejected).

### M3 · Invites, onboarding, stranger screen
- Welcome screen for strangers: "private family app" text plus a code field; no waitlist (LL52).
- Admin: create a single-use 7-day invite and share it from the share sheet; invite list with statuses and revoke (LL70).
- Onboarding: invite → email code → date of birth + country (per-country consent-age table; if blocked, delete the Clerk user and release the invite claim, LL60) → username (LL57 rules) + display name + optional avatar → Discover.
- **Check:** tests for invite expiry/reuse, age-floor blocking and username validation. Manually join with a second email.

### M4 · App shell & design system
- Tabs: Home · Discover · New post · Activity · Profile.
- Design tokens (colour, spacing, type) for light and dark mode, following the system theme (LL28, LL45). All strings in one module.
- **Check:** every screen is readable in both themes.

### M5 · Profiles, friends, Discover
- Profile header + grid (LL67); edit profile, with the 14-day username change limit.
- Friend requests: send, cancel, accept, silent decline, 7-day cooldown, crossing requests auto-accepted, unfriend (LL58). Friend lists visible to all members (LL68).
- Discover: member directory + recent posts + search (LL25).
- **Check:** tests for every request transition and cooldown.

### M6 · Media pipeline & posting
- Picker (gallery only, LL10) → photo resized to 1080px JPEG ~80% + 320px thumbnail (LL63).
- Video: reject if over 30s → compress to 720p ~2 Mbps → thumbnail (LL64).
- Upload to a Convex upload URL with progress, retry and a resumable queue on failure (LL42).
- Create post with caption; update the `mediaUsage` counter.
- **Check:** post a photo and a 30s video from Android over mobile data and Wi-Fi; check file sizes in the Convex dashboard.

### M7 · Feed & post detail
- Fan-out to friends on create; paginated home feed; post detail screen.
- Video autoplays muted on Wi-Fi only (LL69); caption edit; post delete (removes files and feed items) (LL13).
- **Check:** tests for fan-out, plus feed cleanup on unfriend/block/delete.

### M8 · Likes & comments
- Like/unlike with stored counts and a likers list. Flat comments; the author can delete their own, and the post owner can delete any on their post (LL14).

### M9 · Activity & push
- Activity feed with live unread badge. Push token registration; Expo push sending from a Convex action.
- Push events per LL62, with likes grouped through a scheduled job.
- **Check:** pushes arrive on Android. iOS follows once Apple enrollment is done (LL88).

### M10 · Safety & admin tools
- Block (full mutual hide + unfriend, LL21). Report with the family-friendly reasons (LL74); reporter gets a thank-you and the outcome (LL75).
- Admin report queue: dismiss, hide content (author notified, 30-day purge cron, restore), suspend/restore member, hard-delete member (LL71, LL72). Audit log for every admin action.
- **Check:** permission tests proving that blocked pairs see nothing of each other on every screen's queries.

### M11 · Account deletion & usage alerts
- In-app account deletion → `deleting` status → background cascade over all tables and files → Clerk user deleted (LL19).
- Admin usage warning at 70% and 90% of storage (LL65). For data sent out, see open question O3.
- **Check:** a dev-deployment script confirms that no rows or files remain for a deleted user (file storage isn't mocked in unit tests).

### M12 · Resilience & monitoring
- Offline banner; cache the last feed page and images; retry queue for uploads (LL42).
- Sentry crash reporting (LL37).
- Maestro flows run locally on Android: sign-in, post photo, like/comment, friend request, report (LL83).

### M13 · Release prep
- Buy famfriend.app; free static host; invite landing page; AASA + assetlinks; privacy policy and terms drafted from the actual data flows (LL46, LL84).
- Clerk **production** instance with domain DNS; Convex **production** deployment on the Starter plan.
- App links config. EAS production builds.
- Google Play closed test with ≥12 family testers for ≥14 days (LL89); Apple enrollment + TestFlight; store listings, age rating, data-safety forms, reviewer demo account (LL35).

---

## 6. Phases 2 & 3 (outline; detailed interview after Phase 1)
- **Stories:** `stories` table, avatar row at the top of the feed, tap-through viewer, friends-only query, expiry cron that deletes files.
- **DMs:** conversations between friends only; real-time `messages` query; message push; block ends the conversation; report a message → `contextSnapshot` with nearby messages → admin queue (LL31).

---

## 7. Testing strategy (LL34, LL83, LL87)
| Layer | Tool | Where |
|---|---|---|
| Permissions & business rules | convex-test + vitest | CI on every PR |
| Types / lint | tsc, expo lint | CI on every PR |
| File cleanup, Clerk webhook, push | Scripts + manual checks against the Dev deployment | Per milestone |
| UI flows | Maestro (Android) | Locally before each release |
| iOS | Manual checklist on your iPhone | After Apple enrollment |

---

## 8. Costs you've accepted
| Item | Cost |
|---|---|
| Convex Starter | $0 base + usage (est. a few $/month with video, LL66) |
| Domain famfriend.app | est. ~$10–20/year (confirm at registrar) |
| Google Play | $25 one-time |
| Apple Developer | $99/year (when iOS testing starts) |
| Clerk, EAS, GitHub Actions, Maestro CLI, Sentry | Free tiers |

---

## 9. Open questions to settle during the milestones
| # | Question | Settle by |
|---|---|---|
| **O1** | **Invite enforcement in Clerk.** LL4 says Clerk sign-up is restricted to valid invites. Clerk's invitations are email-based, but LL70 makes the invitee's email optional. We must check whether Clerk's invitation/ticket flow works with our share-sheet code. If not, the fallback is: Clerk sign-up stays open, the Convex invite code is required before any access, and Clerk users without a redeemed invite are deleted. **I will bring this back to you as a decision, not change it silently.** | M1 |
| O2 | Which free static host serves `.well-known` files with the right content type | M13 |
| O3 | Whether Convex exposes egress usage to code; if not, egress alerts rely on Convex's dashboard/emails | M11 |
| O4 | Upload progress API in SDK 57 (`expo-file-system` upload task vs XHR) | M6 |
| O5 | Sentry free tier and Expo SDK 57 setup | M12 |
| O6 | Whether a card is needed for Convex Starter | Before M6 on prod |

---

## 10. Risks
| Risk | Mitigation |
|---|---|
| Clerk + Convex pairing in Expo not documented together (LL80) | M1 spike before anything else |
| Video compression native module issues | Isolated in M6; dev build from M1 onward |
| Privacy leak between blocked users | Central auth helpers + tests on every query (M2, M10) |
| Store review of an invite-only app (LL32) | Clear stranger screen, reviewer demo account, report/block/delete present |
| Google 14-day closed-test wait | Start the family beta early in M13 |
| Storage/egress growth | 720p/1080px limits, Wi-Fi-only autoplay, usage alerts |
