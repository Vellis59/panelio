# Panelio

Panelio is a durable fork of [Homepage](https://github.com/gethomepage/homepage) with its own product direction in the self-hosted dashboard space.

It keeps a respectful link to Homepage as the upstream foundation, while exploring a different orientation around:

- guided management workflows
- safer configuration UX
- more operable dashboard administration
- a more productized self-hosted dashboard experience

## Current direction

Panelio is **not** trying to position itself as "better than Homepage".

Instead, it is evolving as:
- a different downstream product direction
- still centered on self-hosted dashboards
- with administration as one important feature among others

## What Panelio is focusing on right now

The current early roadmap focuses on:

- improving host validation diagnostics and install UX
- making dashboard administration easier for non-developers
- introducing a homepage overview layer
- shaping a clearer Panelio identity across the product
- exploring future structural product features such as nested and collapsible sub-groups

## Live development environment

Panelio is currently being tested on a real homelab deployment at:

- `https://panelio.vellis.cc`

This deployment is used to validate product behavior in realistic self-hosted conditions.

## Current notable improvements vs the initial fork state

Already implemented in the current iteration:

- guided host validation diagnostics instead of opaque startup failure
- setup-aware troubleshooting help for real deployment patterns
- `PANELIO_ADMIN_PASSWORD` naming with legacy fallback support
- admin support for renaming groups
- automatic URL normalization for entries like `test.vellis.cc` → `https://test.vellis.cc`
- a first **Panelio Overview** section on the homepage

## Getting started

### With Docker

A simple local deployment example for the current fork is available in:

- `deploy/panelio-homelab/`

Example:

```bash
cd deploy/panelio-homelab
docker compose up -d --build
```

### From source

```bash
pnpm install
pnpm build
pnpm start
```

If this is your first time starting, copy the `src/skeleton` directory to `config/` to populate initial example config files.

## Important environment variables

### Host validation

```bash
HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc
```

### Admin password

```bash
PANELIO_ADMIN_PASSWORD=your_password_here
```

Legacy `HOMEPAGE_ADMIN_PASSWORD` is still supported as a compatibility fallback for now.

## Product note

Panelio still contains many Homepage-era internals, conventions, and docs. That is expected at this stage of the fork.

The project is currently in the phase where:
- the product direction is being clarified
- the live UX is being improved in small but meaningful steps
- the repository and public identity are progressively being realigned

## Upstream respect

Homepage remains the respected upstream project and the technical starting point for this fork.

If you are looking for the original project, documentation, and broader community ecosystem, see:

- Homepage repo: `https://github.com/gethomepage/homepage`
- Homepage docs: `https://gethomepage.dev/`

## Status

Panelio is currently in an **active early product-shaping phase**.

The goal right now is not to rush a full divergence, but to make steady, validated improvements that justify the fork’s direction.
