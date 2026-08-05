# Twenty CRM - Access & Configuration

> **NOTE:** The SSH connection and reverse proxy were set up via the NAT IP `72.60.104.84` (which forwards to this server), but the server's real public IP is `76.13.214.174`. Use `76.13.214.174` for DNS records.

## Server

| Key | Value |
|-----|-------|
| **Host** | `76.13.214.174` (real IP) |
| **NAT SSH Host** | `72.60.104.84` |
| **SSH User** | `root` |
| **SSH Port** | `22` |
| **OS** | Debian 13 (trixie) |
| **URL** | `http://crm.suarify.my` |
| **Server Config Path** | `/opt/twenty/` |

## Twenty CRM

| Variable | Value |
|----------|-------|
| **SERVER_URL** | `http://crm.suarify.my` |
| **PG_DATABASE_PASSWORD** | `emKJlyqBhcRcNQzDMckh` |
| **ENCRYPTION_KEY** | `MNTulImNrBg1xMwCA73Xs6GD8T9K5Du/w4ZRFGS+NPM=` |
| **TAG** | `latest` |
| **STORAGE_TYPE** | `local` |
| **Internal Port** | `3001` (host) → `3000` (container) |

> **Do not lose `ENCRYPTION_KEY`** — losing it means losing access to all OAuth tokens, application variables, TOTP secrets, and sensitive config stored in the database.

## Container Stack

| Service | Image | Status |
|---------|-------|--------|
| `twenty-server` | `twentycrm/twenty:latest` | Port 3001:3000 |
| `twenty-worker` | `twentycrm/twenty:latest` | Background jobs |
| `twenty-db` | `postgres:16` | Port 5432 (internal) |
| `twenty-redis` | `redis` | Port 6379 (internal) |

## Config Path

All files located at `/opt/twenty/`:
- `.env` — environment variables
- `docker-compose.yml` — container configuration

## Reverse Proxy (Caddy)

Caddy routes `crm.suarify.my:80` → `127.0.0.1:3001`

Config: `/etc/caddy/Caddyfile`

## Firewall

Port `3001` added to both `INPUT` (line 3) and `DOCKER-USER` (line 1) iptables chains. Rules persisted via `iptables-persistent`.

## DNS (Netlify)

| Type | Name | Content |
|------|------|---------|
| A | `crm` | `76.13.214.174` |

> **IMPORTANT:** The IP must be `76.13.214.174` (the server's real public IP). The old IP `72.60.104.84` hits a different service (returns 308 redirect) and is NOT this server.

## Useful Commands

```bash
# Check status
cd /opt/twenty && docker compose ps

# View logs
cd /opt/twenty && docker compose logs -f server

# Restart
cd /opt/twenty && docker compose restart

# Full restart
cd /opt/twenty && docker compose down && docker compose up -d

# Database backup
docker exec twenty-db-1 pg_dump -U postgres default > backup_$(date +%Y%m%d).sql

# Database restore
docker compose stop twenty-server twenty-worker
docker exec -i twenty-db-1 psql -U postgres default < backup.sql
docker compose up -d

# Reload Caddy
caddy reload --config /etc/caddy/Caddyfile
```
