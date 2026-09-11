import json, sys, math

# Lightweight forecasting service scaffold. Replace/extend this with statsmodels,
# scikit-learn or your own macro models when the forecast engine is expanded.
def main():
    payload = json.loads(sys.stdin.read() or '{}')
    rows = payload.get('rows', [])
    values = [float(r['value']) for r in rows if r.get('value') is not None]
    horizon = int(payload.get('horizon', 6))
    if len(values) < 3:
        print(json.dumps({'ok': False, 'error': 'Need at least 3 observations for the baseline forecast.'}))
        return
    # Baseline: drift from the most recent observations, intentionally simple and transparent.
    window = values[-6:]
    drift = (window[-1] - window[0]) / max(1, len(window)-1)
    forecast = [window[-1] + drift * (i + 1) for i in range(horizon)]
    print(json.dumps({'method': 'transparent drift baseline', 'horizon': horizon, 'forecast': forecast, 'note': 'Prototype forecast only. Production model can be upgraded with statsmodels/scikit-learn and indicator-specific models.'}))

if __name__ == '__main__':
    main()
