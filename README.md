<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="alpha">
  <img src="https://img.shields.io/badge/license-GPL--3.0-blue" alt="license">
</p>

# Panelio

A modern self-hosted dashboard with a built-in admin UI.

Panelio is a fork of [Homepage](https://github.com/gethomepage/homepage) that adds a full web-based configuration interface — no more editing YAML files by hand.

**🧪 Live demo**: [demo-panelio.vellis.cc](https://demo-panelio.vellis.cc) — explore the full admin in read-only mode.

## Features

- 🖥️ **Visual admin panel** — manage services, bookmarks, widgets and settings from your browser
- 🟢 **Status monitoring** — real-time health dots on each service card
- ⭐ **Favorites bar** — pin your most-used services to the top
- 🎨 **Glass card style** — modern, clean dashboard aesthetic with multiple card themes
- 🔍 **Search & filters** — tag services for cross-group filtering
- 💾 **Import / Export** — backup and restore your entire config in one click
- 🔐 **Password-protected admin** — single-user auth, no database required
- 📱 **Responsive** — works on desktop and mobile

## Quick Start

### Docker (recommended)

```bash
# Pull the image from GitHub Container Registry
docker pull ghcr.io/vellis59/panelio:latest

# Or use docker compose
curl -O https://raw.githubusercontent.com/Vellis59/panelio/main/deploy/docker-compose.yml
docker compose up -d
```

Open **http://localhost:3011** for the dashboard, **http://localhost:3011/admin** for the admin panel.

### Without Docker

```bash
git clone https://github.com/Vellis59/panelio.git
cd panelio
pnpm install
cp -r deploy/config ./config
HOMEPAGE_ALLOWED_HOSTS=localhost PANELIO_ADMIN_PASSWORD=changeme pnpm dev
```

### EasyPanel / Coolify / PaaS

1. Point your platform to `https://github.com/Vellis59/panelio.git` (branch `main`)
2. Set environment variables:

| Variable | Description |
|---|---|
| `HOMEPAGE_ALLOWED_HOSTS` | Your domain (e.g. `panelio.example.com`) |
| `PANELIO_ADMIN_PASSWORD` | Admin panel password |
| `PUID` / `PGID` | User/group ID (default `1000`) |

3. Mount a persistent volume at `/app/config`
4. Expose port **3000**

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `HOMEPAGE_ALLOWED_HOSTS` | yes | — | Allowed hostnames (comma-separated) |
| `PANELIO_ADMIN_PASSWORD` | no | — | Password for `/admin` |

### Admin Panel

Go to `/admin` and log in. From there you can:

- Add, edit, reorder and delete **services** and **groups**
- Manage **bookmarks**
- Configure **widgets**
- Change **themes**, card styles, status dots, greeting message
- **Import / Export** your full configuration

### Files

All configuration lives in `config/` (mounted volume):

```
config/
├── services.yaml    # Services and groups
├── bookmarks.yaml   # Quick links
├── widgets.yaml     # Integrations
└── settings.yaml    # Theme and preferences
```

## Acknowledgements

Panelio is built on top of [Homepage](https://github.com/gethomepage/homepage) by [benphelps](https://github.com/benphelps). We're taking it in a different direction with a focus on zero-config administration.

## License

[GPL-3.0](LICENSE)

---

## Screenshots

<img src="docs/screenshots/dashboard-dark.jpg" alt="Dashboard dark mode">

<img src="docs/screenshots/dashboard-light.jpg" alt="Dashboard light mode">

<img src="docs/screenshots/glass-cards.jpg" alt="Glass card style">

<img src="docs/screenshots/status-dots.jpg" alt="Status dots">

<img src="docs/screenshots/pinned-bar.jpg" alt="Pinned bar">

<img src="docs/screenshots/admin-panel.jpg" alt="Admin panel">
