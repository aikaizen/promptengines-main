# PantheonOS Dashboard Integration

The consulting analytics system is designed for seamless integration with the PantheonOS central dashboard.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  Consulting     │────▶│  consulting-metrics  │────▶│  PantheonOS     │
│  Analytics        │     │  .json               │     │  Dashboard      │
│  (events.jsonl)   │     │  (export adapter)    │     │  (central)      │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
```

## Integration Points

### 1. Portfolio Registry
Consulting is already listed in the PantheonOS portfolio as a product:
```json
{
  "name": "Consulting",
  "state": "active",
  "focus": "services into product flywheel"
}
```

### 2. Metric Families
The export adapter provides metrics in PantheonOS format:

**Finance:**
- `revenue.total`, `revenue.this_month`, `revenue.growth_percent`
- `pipeline.value`, `pipeline.proposals`
- `profitability.effective_hourly_rate`

**Growth:**
- `clients.active`, `clients.total`, `clients.new_this_month`
- `deals.won`, `deals.lost`, `deals.win_rate`
- `activity.calls_this_month`, `activity.hours_this_month`

**Engagement:**
- `client_health` — per-client status, revenue, last contact

### 3. Build Stream Integration
Recent consulting activities feed into the dashboard's build stream:
```json
{
  "date": "2026-03-14",
  "type": "win",
  "client": "Acme Corp",
  "value": 5000,
  "note": "Closed deal!"
}
```

## Export Commands

```bash
# View metrics (stdout)
node scripts/export-consulting-metrics.js

# Save to analytics/consulting-metrics.json
node scripts/export-consulting-metrics.js --save

# Export for PantheonOS dashboard
node scripts/export-consulting-metrics.js --dashboard
```

## Dashboard Data Format

The exported `consulting-metrics.json` follows PantheonOS conventions:

```json
{
  "summary": {
    "revenue_this_month": 5000,
    "revenue_growth": "25.0",
    "active_clients": 3,
    "pipeline_value": 15000,
    "win_rate": "66.7",
    "last_updated": "2026-03-14T15:30:00Z"
  },
  "metrics": {
    "finance": { ... },
    "growth": { ... },
    "engagement": { ... }
  },
  "recent_activity": [ ... ],
  "meta": {
    "business_unit": "consulting",
    "exported_at": "..."
  }
}
```

## Dashboard Panel Design

When the PantheonOS dashboard renders the Consulting business unit, it should display:

### Header Panel
- Revenue this month (with growth indicator)
- Active clients / Total clients
- Pipeline value
- Win rate

### Activity Panel
- Recent calls, proposals, wins
- Hours logged this month
- Effective hourly rate

### Client Health Panel
- Client list with status (lead → prospect → active)
- Revenue per client
- Days since last contact

### Trend Panel
- Monthly revenue chart
- Deal flow (proposals → wins/losses)
- Hours vs revenue correlation

## Cron Integration

Add to heartbeat or cron for automatic dashboard updates:

```bash
# Export metrics every 6 hours
0 */6 * * * cd /path/to/promptengines-main && node scripts/export-consulting-metrics.js --dashboard
```

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Dashboard webhook notifications
- [ ] Goal tracking vs actuals
- [ ] Forecasting based on pipeline
- [ ] Integration with other business units (Storybook Studio, Kaizen, etc.)

## Migration Path

When PantheonOS dashboard moves to its own deployment:

1. `consulting-metrics.json` becomes an API endpoint
2. Dashboard fetches from `https://api.promptengines.com/consulting/metrics`
3. Real-time sync via WebSocket or Server-Sent Events
4. Authentication via PantheonOS token system

---

**Current Status:** Ready for dashboard integration. Run `export-consulting-metrics.js --dashboard` to generate the data file.
