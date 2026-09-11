# Macro Engine — Update Architecture

## Goal
After the one-time desktop installation, routine macro-data and indicator-catalog changes should not require downloading a new ZIP.

## Two update lanes

### 1. Content/data updates — no app replacement
The app stores the indicator catalog in the local SQLite database (`app_content`). A JSON content pack can update:
- countries
- Economy / Policy / Market sections
- indicator names/descriptions
- source metadata
- engine labels

Configure `contentPackUrl` in the in-app Update Center. The app can then sync the JSON pack and persist it locally. The bundled catalog remains the fallback.

**Do not put executable JavaScript/TypeScript code in SQLite or content packs.**

### 2. Executable code updates — signed application updater
When the actual Electron/Node/React code changes, the application binary must be updated. The safe production pattern is a signed Electron updater backed by a release server/GitHub Releases. This build keeps the boundary explicit: content changes can be hot-synced; executable changes require the signed updater lane.

## Suggested production hosting
Publish one stable JSON URL for the catalog, for example:

`https://YOUR-DOMAIN/macro-engine/catalog.json`

The JSON must match `data/catalog.json` in this project. Change the JSON on the server; users press **Sync Content** (or use the future scheduled sync) and do not download another project ZIP.

## Database principle
SQLite is for **data and configuration**, not executable code. Database schema migrations are versioned in the Electron main process so new tables can be added without deleting existing user data.

## Current build
- Bundled catalog: `data/catalog.json`
- Local table: `app_content`
- IPC: `catalog:get`, `catalog:sync`, `catalog:reset`
- UI: Update Center (gear button)
- NFP live data remains separate and continues to use Forex Factory weekly JSON + cache + verified snapshot fallback.
