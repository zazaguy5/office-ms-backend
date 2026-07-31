const express = require('express');
const { getUsers, login, register } = require('../controllers/user.controller');

const router = express.Router();

// ดึงข้อมูลผู้ใช้ทั้งหมด
//router.get('/', getUsers);

// ล็อกอิน
router.post('/login', login);

// สมัครบัญชีผู้ใช้
router.post('/register', register);

module.exports = router;