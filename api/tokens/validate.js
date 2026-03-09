/**
 * POST /api/tokens/validate
 *
 * Validates an invitation token.
 * Stub implementation — returns mock response.
 *
 * Request body: { token: string }
 * Response: { valid: boolean, scope?: string, expiresAt?: string }
 */

const DEMO_TOKENS = {
  'TEAM-DEMO-2026-JOIN': {
    scope: 'full_member',
    expiresAt: null,
    status: 'active'
  }
};

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token is required', valid: false });
  }

  const normalized = token.trim().toUpperCase();

  // Token format check
  const tokenPattern = /^TEAM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!tokenPattern.test(normalized)) {
    return res.status(400).json({ error: 'Invalid token format', valid: false });
  }

  // Lookup — in production this queries Supabase
  const entry = DEMO_TOKENS[normalized];

  if (!entry || entry.status !== 'active') {
    return res.status(200).json({ valid: false });
  }

  // Check expiration
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    return res.status(200).json({ valid: false, reason: 'expired' });
  }

  return res.status(200).json({
    valid: true,
    scope: entry.scope,
    expiresAt: entry.expiresAt
  });
};
