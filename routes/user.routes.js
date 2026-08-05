const express = require('express');
const { getUsers, login, register, getProfile, updateProfile } = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ดึงข้อมูลผู้ใช้ทั้งหมด
//router.get('/', getUsers);

// ล็อกอิน
router.post('/login', login);

// สมัครบัญชีผู้ใช้
router.post('/register', register);

// ดึงข้อมูลผู้ใช้ตามไอดี
router.get('/profile/:id', requireAuth, getProfile);

// แก้ไขข้อมูลผู้ใช้
router.put('/profile', requireAuth, updateProfile);

module.exports = router;