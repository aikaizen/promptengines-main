#!/usr/bin/env node

/**
 * Consulting Analytics → PantheonOS Dashboard Adapter
 * 
 * Exports consulting metrics in PantheonOS dashboard-compatible format.
 * Generates consulting-metrics.json for central dashboard consumption.
 * 
 * Usage:
 *   node scripts/export-consulting-metrics.js          # Export to stdout
 *   node scripts/export-consulting-metrics.js --save   # Save to file
 *   node scripts/export-consulting-metrics.js --dashboard # Export to dashboard data dir
 */

const fs = require('fs');
const path = require('path');

const ANALYTICS_DIR = path.join(__dirname, '..', 'analytics');
const DATA_DIR = path.join(ANALYTICS_DIR, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

// PantheonOS dashboard data paths (relative to workspace)
const DASHBOARD_DATA_DIR = path.join(__dirname, '..', 'pantheon-dashboard', 'data');
const METRICS_OUTPUT_FILE = path.join(DASHBOARD_DATA_DIR, 'consulting-metrics.json');

function loadEvents() {
  if (!fs.existsSync(EVENTS_FILE)) {
    return [];
  }
  return fs.readFileSync(EVENTS_FILE, 'utf-8')
    .trim()
    .split('\n')
    .filter(line => line)
    .map(line => JSON.parse(line));
}

function calculateMetrics(events) {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7); // "2026-03"
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
  
  // Filter events by month
  const thisMonthEvents = events.filter(e => e.date.startsWith(thisMonth));
  const lastMonthEvents = events.filter(e => e.date.startsWith(lastMonth));
  
  // Calculate metrics helper
  const calc = (evts) => ({
    revenue: evts.filter(e => e.type === 'win').reduce((sum, e) => sum + e.value, 0),
    proposals: evts.filter(e => e.type === 'proposal').length,
    wins: evts.filter(e => e.type === 'win').length,
    losses: evts.filter(e => e.type === 'loss').length,
    hours: evts.filter(e => e.type === 'hours').reduce((sum, e) => sum + e.value, 0),
    calls: evts.filter(e => e.type === 'call').length,
    expenses: evts.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.value, 0)
  });
  
  const allTime = calc(events);
  const thisMonthStats = calc(thisMonthEvents);
  const lastMonthStats = calc(lastMonthEvents);
  
  // Growth calculations
  const growth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };
  
  // Active clients (had activity in last 90 days)
  const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const activeClients = [...new Set(
    events.filter(e => e.date >= ninetyDaysAgo).map(e => e.client)
  )];
  
  // Client breakdown
  const clientStats = {};
  events.forEach(e => {
    if (!clientStats[e.client]) {
      clientStats[e.client] = { 
        revenue: 0, hours: 0, proposals: 0, calls: 0, 
        firstContact: e.date, lastContact: e.date 
      };
    }
    if (e.type === 'win') clientStats[e.client].revenue += e.value;
    if (e.type === 'hours') clientStats[e.client].hours += e.value;
    if (e.type === 'proposal') clientStats[e.client].proposals++;
    if (e.type === 'call') clientStats[e.client].calls++;
    if (e.date < clientStats[e.client].firstContact) clientStats[e.client].firstContact = e.date;
    if (e.date > clientStats[e.client].lastContact) clientStats[e.client].lastContact = e.date;
  });
  
  // Pipeline value (proposals not yet won/lost)
  const proposedClients = new Set(events.filter(e => e.type === 'proposal').map(e => e.client));
  const wonLostClients = new Set([
    ...events.filter(e => e.type === 'win').map(e => e.client),
    ...events.filter(e => e.type === 'loss').map(e => e.client)
  ]);
  const pipelineClients = [...proposedClients].filter(c => !wonLostClients.has(c));
  const pipelineValue = events
    .filter(e => e.type === 'proposal' && pipelineClients.includes(e.client))
    .reduce((sum, e) => sum + e.value, 0);
  
  return {
    // Summary (for dashboard header)
    summary: {
      revenue_this_month: thisMonthStats.revenue,
      revenue_last_month: lastMonthStats.revenue,
      revenue_growth: growth(thisMonthStats.revenue, lastMonthStats.revenue),
      revenue_total: allTime.revenue,
      active_clients: activeClients.length,
      total_clients: Object.keys(clientStats).length,
      pipeline_value: pipelineValue,
      proposals_outstanding: pipelineClients.length,
      win_rate: allTime.wins + allTime.losses > 0 
        ? (allTime.wins / (allTime.wins + allTime.losses) * 100).toFixed(1)
        : 0,
      effective_rate: allTime.hours > 0 
        ? (allTime.revenue / allTime.hours).toFixed(0)
        : 0,
      hours_this_month: thisMonthStats.hours,
      hours_total: allTime.hours,
      last_updated: new Date().toISOString()
    },
    
    // Metric families (PantheonOS format)
    metrics: {
      finance: {
        revenue: {
          total: allTime.revenue,
          this_month: thisMonthStats.revenue,
          last_month: lastMonthStats.revenue,
          growth_percent: growth(thisMonthStats.revenue, lastMonthStats.revenue)
        },
        pipeline: {
          value: pipelineValue,
          proposals: pipelineClients.length
        },
        expenses: {
          total: allTime.expenses,
          this_month: thisMonthStats.expenses
        },
        profitability: {
          gross: allTime.revenue - allTime.expenses,
          effective_hourly_rate: allTime.hours > 0 
            ? (allTime.revenue / allTime.hours).toFixed(0)
            : 0
        }
      },
      growth: {
        clients: {
          active: activeClients.length,
          total: Object.keys(clientStats).length,
          new_this_month: thisMonthEvents.filter(e => 
            !events.some(prev => prev.client === e.client && prev.date < e.date)
          ).length
        },
        deals: {
          won: allTime.wins,
          lost: allTime.losses,
          win_rate: allTime.wins + allTime.losses > 0 
            ? (allTime.wins / (allTime.wins + allTime.losses) * 100).toFixed(1)
            : 0,
          proposals_sent: allTime.proposals
        },
        activity: {
          calls_this_month: thisMonthStats.calls,
          hours_this_month: thisMonthStats.hours,
          calls_total: allTime.calls
        }
      },
      engagement: {
        client_health: Object.entries(clientStats).map(([name, stats]) => ({
          name,
          revenue: stats.revenue,
          hours: stats.hours,
          proposals: stats.proposals,
          calls: stats.calls,
          last_contact: stats.lastContact,
          status: stats.revenue > 0 ? 'active' : stats.proposals > 0 ? 'prospect' : 'lead'
        })).sort((a, b) => b.revenue - a.revenue)
      }
    },
    
    // Build stream style recent activity
    recent_activity: events.slice(-10).reverse().map(e => ({
      date: e.date,
      type: e.type,
      client: e.client,
      value: e.value,
      note: e.note?.slice(0, 100) || ''
    })),
    
    // Metadata
    meta: {
      business_unit: 'consulting',
      source: 'analytics/data/events.jsonl',
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
  };
}

function exportMetrics() {
  const events = loadEvents();
  
  if (events.length === 0) {
    console.error('No events found. Log some work first:');
    console.error('  node scripts/log-work.js call "Client" 30 "Discovery"');
    process.exit(1);
  }
  
  const metrics = calculateMetrics(events);
  return JSON.stringify(metrics, null, 2);
}

// CLI
const args = process.argv.slice(2);
const saveToFile = args.includes('--save');
const saveToDashboard = args.includes('--dashboard');

if (saveToDashboard) {
  // Ensure dashboard data dir exists
  if (!fs.existsSync(DASHBOARD_DATA_DIR)) {
    fs.mkdirSync(DASHBOARD_DATA_DIR, { recursive: true });
  }
  
  const metrics = exportMetrics();
  fs.writeFileSync(METRICS_OUTPUT_FILE, metrics);
  console.log(`✓ Exported to ${METRICS_OUTPUT_FILE}`);
  console.log('This file can be consumed by the PantheonOS central dashboard.');
} else if (saveToFile) {
  const outputFile = path.join(ANALYTICS_DIR, 'consulting-metrics.json');
  const metrics = exportMetrics();
  fs.writeFileSync(outputFile, metrics);
  console.log(`✓ Saved to ${outputFile}`);
} else {
  console.log(exportMetrics());
}
