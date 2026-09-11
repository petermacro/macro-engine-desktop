# Macro Engine Desktop — Final v14

A Windows desktop macro research terminal organized as:

**Country → Economy Engine → Policy Engine → Market Engine → Indicator → Detail Page**

## Final UI
- Left rail: United States, Canada, Japan, Euro Area, United Kingdom, China, India, Australia.
- Three engines: Economy Engine, Policy Engine, Market Engine.
- Economy Engine contains sections 1–16.
- Policy Engine contains sections 17–21.
- Market Engine contains sections 22–25.
- Every indicator opens the same research detail-page template.
- Gold + black + deep-blue visual system.

## Indicator catalog
### Economy Engine
1. Credit & Financial Conditions
2. Household Income & Purchasing Power
3. Consumer Spending & Demand
4. Consumer & Business Sentiment
5. Housing & Real Estate
6. Business Demand & Trade
7. Business Surveys (Leading)
8. Production & Capacity
9. Inventories & Energy
10. Labour Demand
11. Employment Outcome
12. Wages, Productivity & Costs
13. Input Prices (Producer)
14. Consumer Inflation
15. Inflation Expectations
16. Fed's Key Inflation Gauge

### Policy Engine
17. Fiscal / Government
18. International Flows
19. Treasury Auctions
20. Policy Communication (Fed & Others)
21. Major Policy Events

### Market Engine
22. Rate Expectations
23. Treasury Yields
24. USD (Dollar)
25. US Indices (NQ / ES / YM)

## NFP production data path
NFP is the fully validated release-vintage indicator in this build.

- Primary historical source: verified Forex Factory release snapshot.
- Live update attempt: Forex Factory weekly JSON export.
- 429 handling: cache + retry window + historical snapshot fallback.
- Storage: local SQLite via sql.js.
- Latest verified NFP: 162K Actual, 55K Forecast, 21K Previous, +107K Surprise (2026-09-04).
- Historical window preserves the delayed Oct/Nov 2025 dual-release date and therefore contains 13 rows.

## Detail page
For NFP the detail page includes:
- Actual
- Forecast / Estimate
- Previous
- Surprise
- Bullish / Bearish market bias
- 12-month historical chart
- 12-month release table
- Recent-release observations
- Jobs → Fed expectations → yields → USD → equities/gold interpretation chain
- Source/reference and machine-readable feed links

For other indicators, the same research template is ready without inventing data. Dedicated source adapters can populate their actual historical series without changing the UI.

## Technology
- React + TypeScript: frontend
- Vite: development/build
- Electron: Windows desktop shell
- Node.js: main process/data layer
- sql.js / SQLite: local persistence
- Lucide React: icons
- XLSX / jsPDF: exports
- Python: retained forecasting component for future statistical models

## Run
```powershell
npm install
npm run dev
```

## Test
```powershell
npm run test:ff
npm run test:all
```

## Build Windows installer
```powershell
npm run dist
```

The installer is written to `release/`.
