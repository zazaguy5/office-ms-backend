// ดึง Service ที่เกี่ยวกับ users มาทั้งหมด
const userService = require('../services/user.service');

async function getUsers(req, res, next) {
  try {
    const users = await userService.fetchUsers();
    res.status(200).json({
      status: 'success',
      message: 'get Users successful',
      data: users
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
}

async function login(req, res, next) {
  try {
    const result = await userService.login(req.body.username, req.body.password);
    res.status(200).json({
      status: 'success',
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const result = await userService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Register successful'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUsers, login, register };