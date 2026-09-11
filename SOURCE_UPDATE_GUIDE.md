# V13.0 Source Update Guide

## Why the source changed

The dashboard previously derived NFP as the month-to-month difference of the current BLS CES0000000001 employment level series. BLS revisions can change historical values. Forex Factory's calendar instead records the release-vintage Actual/Forecast/Previous values shown to traders.

## Current implementation

1. Bundled verified Forex Factory NFP snapshot is the historical baseline.
2. Forex Factory weekly JSON is queried on refresh.
3. If the weekly JSON contains a released NFP actual, that release is merged into the snapshot.
4. The dashboard calculates Surprise as Actual - Forecast.
5. SQLite is persistence, not the source of truth for the current display.

## Do not replace the snapshot with current BLS level differences.
