const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { signAccessToken } = require('../config/jwt');
const { generateRefreshToken, hashToken } = require('../config/tokenHash');
const { apiMsg } = require('../modules/apiResponse.module');
require('../modules/auth.module');

const REFRESH_TOKEN_TTL_DAYS = 7;

async function login(username, password) {
  const result = await pool.query('select * from users where users."accname" = $1', [username]);
  const user = result.rows[0];
  //console.log(`Enter password: ${password}, User password: ${user.password}`);

  if (user) {
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return apiMsg(401, 'error', 'Invalid username or password');
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const { refreshToken, expiresAt } = await issueRefreshToken(user.id);
    return apiMsg(200, 'success', 'Login successful', {
      accessToken: accessToken,
      refreshToken: refreshToken,
      refreshExpiresAt: expiresAt,
      user: { id: user.id, username: user.username, name: user.name, sirname: user.sirname, role: user.role }
    });
  } else {
    return apiMsg(401, 'error', 'Invalid username or password');
  }
}

// สร้าง refresh token ใหม่และบันทึกลง DB (เก็บแค่ hash)
async function issueRefreshToken(userId) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return { refreshToken, expiresAt };
}

// ใช้ refresh token แลก access token ใหม่ + หมุน refresh token ใหม่
async function refresh(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) {
    return apiMsg(401, 'error', 'Not found refresh token');
  }

  const tokenHash = hashToken(refreshTokenFromCookie);
  const result = await pool.query(
    `SELECT rt.*, u.role, u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1`,
    [tokenHash]
  );
  const stored = result.rows[0];

  if (!stored) {
    // token ไม่พบใน DB — อาจถูกใช้ไปแล้ว (reuse) หรือปลอมมา
    return apiMsg(401, 'error', 'Refresh token is invalid or has been used. Please log in again.');
  }

  // Refresh Token หมดอายุ
  if (new Date(stored.expires_at) < new Date()) {
    await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [stored.id]);
    return apiMsg(401, 'error', 'Refresh token are expired. Please log in again.');
  }

  // ลบ Refresh Token ตัวเก่า ออกตัวใหม่ทันที ป้องกันการใช้ token เดิมซ้ำ
  await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [stored.id]);
  const accessToken = signAccessToken({ userId: stored.user_id, role: stored.role });
  const { refreshToken, expiresAt } = await issueRefreshToken(stored.user_id);

  return apiMsg(200, 'success', 'Refresh token successful', {
    accessToken: accessToken,
    refreshToken: refreshToken,
    refreshExpiresAt: expiresAt,
    user: { id: stored.id, username: stored.username, name: stored.name, role: stored.role }
  });
}

// Logout: ลบ refresh token ออกจาก DB (revoke ทันที)
async function logout(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) return apiMsg(400, 'error', 'No refresh token provided');
  const tokenHash = hashToken(refreshTokenFromCookie);
  const result = await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [tokenHash]);
  if (result.rowCount === 0) {
    return apiMsg(404, 'error', 'Refresh token not found or already revoked');
  }
  return apiMsg(200, 'success', 'Logout successful');
}

// Logout ทุกอุปกรณ์ (ลบ refresh token ทั้งหมดของ user นั้น)
async function logoutAllDevices(userId) {
  const result = await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  return apiMsg(200, 'success', 'All devices logged out successfully');
}

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { login, refresh, logout, logoutAllDevices, AuthError };