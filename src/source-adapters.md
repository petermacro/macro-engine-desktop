# Source adapter map

The UI is intentionally separated from data providers. Add or change providers in `src/config.ts`, then implement the corresponding fetch/parse logic in `electron/main.cjs`.

## Current live adapter
- FRED CSV: enabled for indicators with a `seriesId` and `sourceId: fred`.

## Planned official adapters
- BLS Public Data API
- BEA API
- Treasury Fiscal Data API
- Census APIs
- EIA API
- Federal Reserve official releases/pages
- User-supplied official websites from your source list

Do not put provider API keys in the React frontend. Keep secrets in environment variables or the Electron/Python backend.
