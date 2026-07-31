const express = require('express');
const { login, refresh, logout } = require('../controllers/auth.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// ล็อกอิน
router.post('/login', login);

// ดึง Access Token ใหม่
router.post('/refresh', refresh);

// ออกจากระบบและลบ refresh_tokens ออกด้วย
router.post('/logout', logout);


// ตัวอย่างการใช้ middleware ป้องกัน route
router.get('/me', requireAuth, (req, res) => {
  res.json({ status: 'success', user: req.user });
});
 
// ตัวอย่าง route เฉพาะ admin
router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ status: 'success', message: 'เข้าถึงส่วน admin ได้' });
});

module.exports = router;