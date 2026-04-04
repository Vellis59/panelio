# Panelio — Product Promise, Roadmap & Divergence Map

## Product Promise

**Panelio** is a self-hosted application dashboard with a built-in web admin interface.

### For whom?
Solo makers, homelabbers, and small teams who run self-hosted services and want a clean overview without touching YAML files.

### What does it do?
- Displays your services on a modern, customizable dashboard
- Lets you configure everything through a web UI (admin panel at `/admin`)
- Monitors service health with real-time status indicators
- Pins favorite services for quick access
- Supports tags, themes, import/export — zero database required

### What it is NOT
- Not a monitoring platform (no alerting, no metrics history)
- Not a multi-user platform (v1 is single-user)
- Not a Kubernetes management tool
- Not a replacement for proper reverse proxy / infrastructure tooling

### Scope boundary
Panelio reads and writes YAML config files. It does not manage containers, deploy apps, or provision infrastructure. The admin UI is a convenience layer on top of a file-based configuration — keeping things simple and portable.

---

## Roadmap

Organized into four tracks. Each track advances independently.

### Track 1: Product Experience
Features that users see and interact with on the dashboard.

| Status | Item | Description |
|---|---|---|
| ✅ Done | Glass card style | Modern card aesthetic with gradients |
| ✅ Done | Status dots | Real-time health indicators per service |
| ✅ Done | Favorites bar | Pin services to top |
| ✅ Done | Tags & filtering | Cross-group service categorization |
| ✅ Done | Dynamic greeting | Welcome message with clock |
| ✅ Done | Pre-built themes | Color presets with gradients |
| 🔲 Todo | Multi-page dashboards | Switch between dashboard views |
| 🔲 Todo | Service Health Dashboard | Dedicated health overview page |
| 🔲 Todo | Quick Actions on cards | Contextual actions menu (WIP — needs stabilization) |
| 🔲 Todo | Search & filters UX | Global search, large-config optimization |
| 🔲 Todo | First-run onboarding | Guided setup for new users |
| 🔲 Todo | Alternate card styles | Neo Panel, Compact Premium variants |

### Track 2: Admin Foundation
The admin panel at `/admin` — reliability, safety, and completeness.

| Status | Item | Description |
|---|---|---|
| ✅ Done | Auth (password) | Single-user login with HMAC tokens |
| ✅ Done | CRUD services | Add/edit/delete services and groups |
| ✅ Done | CRUD bookmarks | Full bookmark management |
| ✅ Done | CRUD widgets | Widget configuration |
| ✅ Done | Settings editor | Theme, card style, features toggles |
| ✅ Done | Import / Export | Full config backup and restore |
| ✅ Done | Group reorder | Drag services/groups up and down |
| ✅ Done | Sub-groups | Nested service organization |
| ✅ Done | Auto-revalidation | Changes propagate without restart |
| 🔲 Todo | Settings API CRUD | Full programmatic settings management |
| 🔲 Todo | Config Health Center | Validate YAML, detect errors, suggest fixes |
| 🔲 Todo | Backup History | Keep multiple backups, restore from history |
| 🔲 Todo | Secrets handling | Mask sensitive values, safe display |
| 🔲 Todo | URL normalization | Auto-fix missing protocols |

### Track 3: Architecture & Operations
Under the hood — maintainability, deployment, and upstream management.

| Status | Item | Description |
|---|---|---|
| ✅ Done | Standalone build | Next.js output: standalone for Docker |
| ✅ Done | Host validation | Configurable allowed hosts with diagnostic UI |
| 🔲 Todo | Upstream rebase strategy | Decide how/when to sync with Homepage |
| 🔲 Todo | Test coverage | Increase automated test coverage |
| 🔲 Todo | CI/CD pipeline | Automated build, test, and release |
| 🔲 Todo | Config migration system | Handle breaking changes gracefully |
| 🔲 Todo | Multi-user auth | Deferred — single-user for v1 |
| 🔲 Todo | Submit to Coolify app store | One-click install for Coolify users |
| 🔲 Todo | Submit to EasyPanel templates | One-click install for EasyPanel users |

### Track 4: Identity & Community
Positioning, docs, and community presence.

| Status | Item | Description |
|---|---|---|
| ✅ Done | Product name | Panelio |
| ✅ Done | Public repo | github.com/Vellis59/panelio |
| ✅ Done | README | Clean, public-facing documentation |
| ✅ Done | Install guide | Docker, EasyPanel, Coolify, local |
| 🔲 Todo | Logo & branding | Visual identity |
| 🔲 Todo | Demo instance | Public read-only demo |
| 🔲 Todo | Website / landing page | panelio.io or similar |
| 🔲 Todo | Contribution guide | For future contributors |

---

## Divergence Map from Homepage (upstream)

Panelio forks from [gethomepage/homepage](https://github.com/gethomepage/homepage) v1.12.3 (GPL-3.0).

### Files added (Panelio-specific)

**Admin backend:**
- `src/pages/admin/index.jsx` — Login page
- `src/pages/admin/dashboard.jsx` — Full admin dashboard
- `src/pages/api/admin/login.js` — Auth endpoint
- `src/pages/api/admin/check.js` — Session check
- `src/pages/api/admin/services.js` — Services CRUD
- `src/pages/api/admin/bookmarks.js` — Bookmarks CRUD
- `src/pages/api/admin/widgets.js` — Widgets CRUD
- `src/pages/api/admin/settings.js` — Settings CRUD
- `src/pages/api/admin/export.js` — Import/Export
- `src/pages/api/admin/pin.js` — Favorites toggle
- `src/pages/api/panelio-settings.js` — Public settings API
- `src/pages/api/ping-url.js` — URL health check
- `src/utils/admin/auth.js` — Auth middleware (HMAC, cookies)
- `src/utils/admin/yaml-crud.js` — YAML read/write with backup
- `src/components/admin/BackupTab.jsx` — Import/Export UI

**Dashboard features:**
- `src/components/pinned-bar.jsx` — Favorites bar
- `src/components/panelio-greeting.jsx` — Dynamic greeting
- `src/components/panelio-host-diagnostic.jsx` — Host validation UI
- `src/components/services/status-dot.jsx` — Health indicator
- `src/styles/panelio-presets.css` — Theme presets

**Deployment:**
- `deploy/docker-compose.yml` — Example compose
- `deploy/config/*` — Example YAML configs
- `docs/troubleshooting/*` — Troubleshooting docs

### Files modified

- `src/components/services/item.jsx` — Glass cards, status dots, pin button, quick actions
- `src/components/bookmarks/item.jsx` — Minor style adjustments
- `src/components/resolvedicon.jsx` — Auto-favicon, emoji, letter fallback
- `src/pages/index.jsx` — Greeting, pinned bar, theme injection, status dots
- `src/pages/_app.jsx` — Panelio CSS import
- `src/pages/api/theme.js` — Extended theme API
- `src/middleware.js` — Host validation with Panelio diagnostics
- `next.config.js` — Standalone output
- `package.json` — Version, dependencies
- `.gitignore` — Panelio-specific ignores

### Divergence strategy
- **Low coupling**: Panelio features are mostly additive (new files, new routes)
- **Modified files**: Changes to upstream components are localized and commented
- **Rebase risk**: Medium — upstream `item.jsx` and `index.jsx` changes could conflict
- **Recommended**: Evaluate upstream releases quarterly; cherry-pick valuable changes rather than full rebase
