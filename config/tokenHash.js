const crypto = require('crypto');

// สุ่ม refresh token ที่จะส่งให้ client เก็บใน httpOnly cookie
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex'); // 96 ตัวอักษร
}

// เก็บแค่ hash ของ token ลงฐานข้อมูล ไม่เก็บค่าจริง
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateRefreshToken, hashToken };