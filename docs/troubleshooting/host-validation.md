---
title: Host Validation Troubleshooting
description: Fix the "Host validation failed" startup problem
icon: material/web-check
---

# Host validation troubleshooting

If Panelio shows:

> `Host validation failed`

it means the request reached the application with a `Host` header that is not currently allowed by `HOMEPAGE_ALLOWED_HOSTS`.

This protection remains intentional. The goal is not to disable it blindly, but to make the fix obvious and fast.

## What Panelio expects

Panelio compares the incoming browser host against the allowed host list.

Examples of valid values can include:

- `panelio.vellis.cc`
- `192.168.1.20:3000`
- `homepage.local`
- `homepage.example.com`

Panelio also tolerates common default-port normalization in many cases, so allowing `panelio.vellis.cc` can also work for requests that arrive as `panelio.vellis.cc:80` or `panelio.vellis.cc:443`.

## The usual fix

Add the exact host you use in the browser to `HOMEPAGE_ALLOWED_HOSTS`.

Example:

```bash
HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc
```

Then restart Panelio and reload the page.

## Common deployment patterns

### Docker Compose

```yaml
services:
  panelio:
    image: ghcr.io/gethomepage/homepage:latest
    environment:
      HOMEPAGE_ALLOWED_HOSTS: panelio.vellis.cc
```

If you access Panelio through a LAN IP instead of a domain, use that exact IP:port instead.

Example:

```yaml
HOMEPAGE_ALLOWED_HOSTS: 192.168.1.20:3000
```

### Reverse proxy (Traefik / Nginx / Caddy / NPM)

Use the public hostname your browser actually opens.

Good example:

```bash
HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc
```

Common mistake:

- allowing only the container name
- allowing only an internal Docker hostname
- forgetting the public domain served by the reverse proxy

### Source install

Export the variable before starting the app:

```bash
HOMEPAGE_ALLOWED_HOSTS=panelio.vellis.cc pnpm start
```

### Kubernetes

Kubernetes can require multiple allowed hosts.

You may need to keep:
- an internal pod or probe host
- and the external ingress host

Example pattern:

```yaml
env:
  - name: HOMEPAGE_ALLOWED_HOSTS
    value: "$(MY_POD_IP):3000,panelio.vellis.cc"
```

## If you are not sure what value to use

Use the host shown in Panelio’s diagnostic screen.

That screen is designed to surface:
- the host Panelio actually received
- the suggested `HOMEPAGE_ALLOWED_HOSTS=...` value
- contextual hints depending on your setup

## What not to do first

You *can* set:

```bash
HOMEPAGE_ALLOWED_HOSTS=*
```

but this should not be the default fix. It is better to allow the exact host you expect.

## Why this exists

Homepage introduced this protection to reduce unsafe API access patterns when requests arrive with unexpected `Host` headers.

Panelio keeps that protection, but tries to make the failure:
- less opaque
- easier to diagnose
- easier to fix for non-developers
