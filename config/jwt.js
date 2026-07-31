const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// อายุ access token แตกต่างกันตาม role
// customer: 15 นาที, admin: 5 นาที (เข้มงวดกว่า เพราะสิทธิ์สูงกว่า)
function getAccessTokenExpiry(role) {
  return role === 'admin' ? '5m' : '15m';
}

function signAccessToken({ userId, role }) {
  return jwt.sign(
    { user_id: userId, role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: getAccessTokenExpiry(role) }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET); // throws ถ้า invalid/expired
}

module.exports = { signAccessToken, verifyAccessToken, getAccessTokenExpiry };