# Panelio homelab deployment

This folder contains a simple local deployment for testing Panelio on a homelab machine.

## Current setup

- Host port: `3011`
- Container port: `3000`
- Container name: `panelio`
- Allowed host: `panelio.vellis.cc`
- Admin password env: `PANELIO_ADMIN_PASSWORD`
- Persistent config path: `./config`

## Start

```bash
cd deploy/panelio-homelab
docker compose up -d --build
```

## Stop

```bash
cd deploy/panelio-homelab
docker compose down
```

## Update after code changes

```bash
cd deploy/panelio-homelab
docker compose up -d --build
```

## Local checks

```bash
curl -I -H 'Host: panelio.vellis.cc' http://127.0.0.1:3011/
curl -H 'Host: panelio.vellis.cc' http://127.0.0.1:3011/api/healthcheck
```

## Admin password

Set a real value for `PANELIO_ADMIN_PASSWORD` in `docker-compose.yml` before exposing the admin in a shared environment.

Legacy `HOMEPAGE_ADMIN_PASSWORD` support still exists in code as a compatibility fallback, but new Panelio deployments should use `PANELIO_ADMIN_PASSWORD`.

## Reverse proxy / domain

Point your reverse proxy for `panelio.vellis.cc` to:

- target host: this homelab machine
- target port: `3011`

Make sure the proxy forwards the original `Host` header.
