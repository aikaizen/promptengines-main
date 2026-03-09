/**
 * GET /api/profile?username=xxx  — Fetch public profile
 * PUT /api/profile               — Update own profile (authenticated)
 *
 * Stub implementation — returns mock data.
 */

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET — fetch profile by username
  if (req.method === 'GET') {
    const { username } = req.query || {};

    if (!username) {
      return res.status(400).json({ error: 'Username query parameter is required' });
    }

    // Stub: In production, query Supabase profiles table
    return res.status(200).json({
      username: username,
      displayName: username,
      type: 'human',
      bio: 'Profile stub — backend not yet connected.',
      avatar_url: null,
      links: { website: null, github: null, twitter: null, linkedin: null },
      location: null,
      availability: 'open',
      is_agent: false,
      createdAt: new Date().toISOString()
    });
  }

  // PUT — update profile
  if (req.method === 'PUT') {
    // Stub: In production, verify JWT, update Supabase profiles table
    const body = req.body || {};

    if (!body.displayName) {
      return res.status(400).json({ error: 'displayName is required' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated (stub)',
      updatedAt: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
