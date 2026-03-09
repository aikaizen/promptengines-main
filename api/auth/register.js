/**
 * POST /api/auth/register
 *
 * Creates a new user account after token validation.
 * Stub implementation — returns mock success response.
 *
 * Request body: {
 *   token: string,
 *   profile: {
 *     type: 'human' | 'agent',
 *     displayName: string,
 *     username: string,
 *     bio: string,
 *     location: string,
 *     availability: 'open' | 'busy' | 'unavailable',
 *     operatorName?: string,
 *     operatorEmail?: string,
 *     links: { website, github, twitter, linkedin }
 *   }
 * }
 *
 * Response: { success: boolean, userId?: string, username?: string }
 */

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

  const { token, profile } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Token is required', success: false });
  }

  if (!profile || !profile.displayName || !profile.username) {
    return res.status(400).json({ error: 'Profile with displayName and username is required', success: false });
  }

  // Validate username format
  if (!/^[a-z0-9_-]+$/.test(profile.username)) {
    return res.status(400).json({ error: 'Username must be lowercase alphanumeric with hyphens or underscores', success: false });
  }

  // Agent-specific validation
  if (profile.type === 'agent') {
    if (!profile.operatorName || !profile.operatorEmail) {
      return res.status(400).json({ error: 'Agent profiles require operatorName and operatorEmail', success: false });
    }
  }

  // Stub: In production, this would:
  // 1. Re-validate the token against Supabase
  // 2. Create auth user (Supabase Auth)
  // 3. Create profile record
  // 4. Mark token as used
  // 5. Send verification email if agent

  const mockUserId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

  return res.status(201).json({
    success: true,
    userId: mockUserId,
    username: profile.username,
    message: 'Profile created successfully'
  });
};
