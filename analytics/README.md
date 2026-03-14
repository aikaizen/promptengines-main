# Consulting Analytics

Privacy-first analytics for your consulting business.

## Two-Tier System

### Tier 1: Website Analytics (Automatic)
**Plausible Analytics** — Privacy-friendly, GDPR-compliant, no cookies

- Tracks page views, referrers, outbound clicks
- No personal data collected
- Data hosted by Plausible (EU servers)
- Simple dashboard at plausible.io

**Setup:** Already added to `consulting/index.html`. Just needs domain verification.

### Tier 2: Work Analytics (Manual)
**Local JSONL storage** — You control everything

Log your consulting activities:
- Client calls and meetings
- Proposals sent
- Deals won/lost
- Billable hours
- Business expenses
- Custom events

## Quick Start

### Log a client call:
```bash
node scripts/log-work.js call "Acme Corp" 30 "Discovery call, went well"
```

### Log a proposal:
```bash
node scripts/log-work.js proposal "Acme Corp" 5000 "Custom AI agent setup"
```

### Log a closed deal:
```bash
node scripts/log-work.js win "Acme Corp" 5000 50 "Closed! Starting Monday"
```

### Log billable hours:
```bash
node scripts/log-work.js hours "Acme Corp" 4.5 "Architecture planning session"
```

### View stats in terminal:
```bash
node scripts/log-work.js stats
```

### Open visual dashboard:
```bash
node scripts/log-work.js dashboard
```

## Command Reference

| Command | Args | Description |
|---------|------|-------------|
| `call` | `<client>` `[duration]` `[note]` | Log a client call |
| `proposal` | `<client>` `<value>` `[note]` | Log proposal sent |
| `win` | `<client>` `<value>` `[hours]` `[note]` | Log closed deal |
| `loss` | `<client>` `<value>` `[note]` | Log lost deal |
| `hours` | `<client>` `<hours>` `[note]` | Log billable hours |
| `expense` | `<vendor>` `<amount>` `[note]` | Log business expense |
| `custom` | `<category>` `<value>` `[note]` | Log custom event |
| `note` | `<client>` `<text>` | Log a note |
| `stats` | — | Show summary statistics |
| `dashboard` | — | Open local dashboard |

## Data Storage

All manual work data is stored locally in:
```
analytics/data/events.jsonl
```

Format (one JSON object per line):
```json
{"id":"evt_123...","timestamp":"2026-03-14T15:30:00Z","date":"2026-03-14","type":"call","client":"Acme Corp","value":30,"note":"Discovery call"}
```

**No cloud sync** — data stays on your machine. Back up `analytics/data/` if needed.

## Dashboard Features

The local dashboard (`analytics/dashboard.html`) shows:

- **Summary Cards:** Revenue, proposals, deals won, hours, win rate, effective rate
- **Recent Events:** Last 20 activities with type badges
- **By Client:** Revenue, hours, proposals, calls per client
- **Quick Commands:** Reference for common logging commands

## Plausible Setup (Optional)

To verify your Plausible dashboard:

1. Go to https://plausible.io/sites
2. Add `consulting.promptengines.com`
3. Verify DNS (add TXT record if required)
4. View real-time dashboard

**Privacy note:** Plausible doesn't use cookies, store personal data, or track across sites. GDPR-compliant by design.

## Tips

- **Log immediately** after calls/meetings while memory is fresh
- **Use consistent client names** — "Acme Corp" and "Acme" will show as different clients
- **Add notes** — future you will thank present you
- **Review weekly** — run `stats` every Friday to see patterns
- **Billable hours** — include all time (calls, research, actual work)

## Export Data

The JSONL format is easy to process:

```bash
# Count all calls
cat analytics/data/events.jsonl | grep '"type":"call"' | wc -l

# Total revenue
cat analytics/data/events.jsonl | jq -s '[.[] | select(.type=="win") | .value] | add'

# Hours by client
cat analytics/data/events.jsonl | jq -s 'group_by(.client) | map({client: .[0].client, hours: [.[].value] | add})'
```

## Future Enhancements

- [ ] CSV export
- [ ] Monthly reports
- [ ] Time-based filtering
- [ ] Goal tracking
- [ ] Simple forecasting

---

**Data ownership:** You own everything. No third parties (except Plausible for website analytics, which is privacy-first).
