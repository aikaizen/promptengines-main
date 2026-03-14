#!/usr/bin/env node

/**
 * Manual Work Logger for Consulting Analytics
 * 
 * Log consulting activities: calls, proposals, deals, hours, revenue
 * Store locally in JSONL format for privacy and control
 * 
 * Usage:
 *   node scripts/log-work.js call "Acme Corp" "30" "Initial discovery call, went well"
 *   node scripts/log-work.js proposal "Acme Corp" "5000" "Custom AI agent setup"
 *   node scripts/log-work.js win "Acme Corp" "5000" "50" "Closed deal, starting Monday"
 *   node scripts/log-work.js hours "Acme Corp" "4.5" "MVP planning session"
 *   node scripts/log-work.js custom "Networking" "1" "Met at TechBreakfast"
 *   node scripts/log-work.js stats                    # Show summary
 *   node scripts/log-work.js dashboard                # Open local dashboard
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DATA_DIR = path.join(__dirname, '..', 'analytics', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const VALID_TYPES = ['call', 'proposal', 'win', 'loss', 'hours', 'expense', 'custom', 'note'];

function logEvent(type, client, value, note = '', extra = {}) {
  if (!VALID_TYPES.includes(type)) {
    console.error(`Unknown event type: ${type}`);
    console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    type,
    client: client || 'Unknown',
    value: parseFloat(value) || 0,
    note,
    ...extra
  };

  fs.appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
  console.log(`✓ Logged: ${type} for "${client}" (${value})`);
}

function showStats() {
  if (!fs.existsSync(EVENTS_FILE)) {
    console.log('No events logged yet.');
    return;
  }

  const events = fs.readFileSync(EVENTS_FILE, 'utf-8')
    .trim()
    .split('\n')
    .filter(line => line)
    .map(line => JSON.parse(line));

  const stats = {
    totalEvents: events.length,
    totalRevenue: events.filter(e => e.type === 'win').reduce((sum, e) => sum + e.value, 0),
    totalProposals: events.filter(e => e.type === 'proposal').length,
    totalWins: events.filter(e => e.type === 'win').length,
    totalLosses: events.filter(e => e.type === 'loss').length,
    totalHours: events.filter(e => e.type === 'hours').reduce((sum, e) => sum + e.value, 0),
    totalCalls: events.filter(e => e.type === 'call').length,
    uniqueClients: [...new Set(events.map(e => e.client))].length,
    winRate: 0
  };

  if (stats.totalWins + stats.totalLosses > 0) {
    stats.winRate = ((stats.totalWins / (stats.totalWins + stats.totalLosses)) * 100).toFixed(1);
  }

  console.log('\n=== Consulting Analytics ===\n');
  console.log(`Total Events:     ${stats.totalEvents}`);
  console.log(`Unique Clients:   ${stats.uniqueClients}`);
  console.log(`Total Revenue:    $${stats.totalRevenue.toLocaleString()}`);
  console.log(`Proposals Sent:   ${stats.totalProposals}`);
  console.log(`Deals Won:        ${stats.totalWins}`);
  console.log(`Deals Lost:       ${stats.totalLosses}`);
  console.log(`Win Rate:         ${stats.winRate}%`);
  console.log(`Hours Logged:     ${stats.totalHours.toFixed(1)}`);
  console.log(`Calls Made:       ${stats.totalCalls}`);
  console.log(`Effective Rate:   $${stats.totalHours > 0 ? (stats.totalRevenue / stats.totalHours).toFixed(0) : 0}/hr`);

  // Last 10 events
  console.log('\n=== Last 10 Events ===\n');
  events.slice(-10).reverse().forEach(e => {
    console.log(`${e.date} | ${e.type.padEnd(8)} | ${e.client.padEnd(20)} | ${e.value.toString().padStart(6)} | ${e.note.slice(0, 40)}`);
  });

  // Clients summary
  const clientStats = {};
  events.forEach(e => {
    if (!clientStats[e.client]) {
      clientStats[e.client] = { revenue: 0, hours: 0, proposals: 0, calls: 0 };
    }
    if (e.type === 'win') clientStats[e.client].revenue += e.value;
    if (e.type === 'hours') clientStats[e.client].hours += e.value;
    if (e.type === 'proposal') clientStats[e.client].proposals++;
    if (e.type === 'call') clientStats[e.client].calls++;
  });

  console.log('\n=== By Client ===\n');
  Object.entries(clientStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .forEach(([client, s]) => {
      console.log(`${client.padEnd(20)} | $${s.revenue.toString().padStart(6)} | ${s.hours.toFixed(1)}h | ${s.proposals} proposals | ${s.calls} calls`);
    });
}

function openDashboard() {
  const dashboardPath = path.join(__dirname, '..', 'analytics', 'dashboard.html');
  const url = `file://${dashboardPath}`;
  
  // Try to open in default browser
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${cmd} "${url}"`, (err) => {
    if (err) {
      console.log(`Dashboard available at: ${dashboardPath}`);
    } else {
      console.log('Opening dashboard...');
    }
  });
}

// CLI
const [,, command, ...args] = process.argv;

switch (command) {
  case 'call':
    logEvent('call', args[0], args[1] || '0', args[2] || '');
    break;
  case 'proposal':
    logEvent('proposal', args[0], args[1] || '0', args[2] || '');
    break;
  case 'win':
    logEvent('win', args[0], args[1] || '0', args[2] || '');
    break;
  case 'loss':
    logEvent('loss', args[0], args[1] || '0', args[2] || '');
    break;
  case 'hours':
    logEvent('hours', args[0], args[1] || '0', args[2] || '');
    break;
  case 'expense':
    logEvent('expense', args[0], args[1] || '0', args[2] || '');
    break;
  case 'custom':
    logEvent('custom', args[0], args[1] || '0', args[2] || '');
    break;
  case 'note':
    logEvent('note', args[0] || 'General', '0', args.join(' '));
    break;
  case 'stats':
    showStats();
    break;
  case 'dashboard':
    openDashboard();
    break;
  default:
    console.log(`
Manual Work Logger for Consulting Analytics

Usage:
  node scripts/log-work.js <command> [args...]

Commands:
  call <client> [duration_min] [note]     - Log a client call
  proposal <client> <value> [note]         - Log proposal sent
  win <client> <value> [hours] [note]      - Log closed deal
  loss <client> <value> [note]             - Log lost deal
  hours <client> <hours> [note]            - Log billable hours
  expense <vendor> <amount> [note]         - Log business expense
  custom <category> <value> [note]         - Log custom event
  note <client> <text>                     - Log a note
  stats                                    - Show summary statistics
  dashboard                                - Open local dashboard

Examples:
  node scripts/log-work.js call "Acme Corp" 30 "Discovery call"
  node scripts/log-work.js proposal "Acme Corp" 5000 "AI agent setup"
  node scripts/log-work.js win "Acme Corp" 5000 50 "Closed! Starting Monday"
  node scripts/log-work.js hours "Acme Corp" 4.5 "Architecture planning"
`);
}
