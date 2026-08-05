const authService = require('../services/auth.service');

const REFRESH_COOKIE_NAME = 'refresh_token';
const isProd = process.env.NODE_ENV === 'production';

// ตั้งค่า cookie กลาง ใช้ซ้ำได้ทั้ง login/refresh
function setRefreshCookie(res, token, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,          // ต้อง true บน production (HTTPS เท่านั้น)
    sameSite: 'lax',      // กัน CSRF, ปรับเป็น 'lax' ถ้า frontend อยู่คนละ subdomain
    expires: expiresAt,
    path: '/api/auth',       // จำกัดให้ cookie ถูกส่งเฉพาะ endpoint ของ auth เท่านั้น
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'Please fill username or password!' });
    }

    const result = await authService.login(username, password);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    delete result.data.refreshToken; // ลบ refreshToken ออกจาก response body
    delete result.data.refreshExpiresAt; // ลบ refreshExpiresAt ออกจาก response body
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await authService.refresh(tokenFromCookie);
 
    setRefreshCookie(res, result.data.refreshToken, result.data.refreshExpiresAt);
    delete result.data.refreshToken; // ลบ refreshToken ออกจาก response body
    delete result.data.refreshExpiresAt; // ลบ refreshExpiresAt ออกจาก response body
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await authService.logout(tokenFromCookie);
    clearRefreshCookie(res);
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, refresh, logout };