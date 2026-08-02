// ดึง Service ที่เกี่ยวกับ users มาทั้งหมด
const userService = require('../services/user.service');

async function getUsers(req, res, next) {
  try {
    const result = await userService.fetchUsers();
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
}

async function login(req, res, next) {
  try {
    const result = await userService.login(req.body.username, req.body.password);
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const result = await userService.register(req.body);
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  const { id } = req.params;

  try {
    const result = await userService.getProfile(id);
    res.status(result.code).json({
      status: result.status,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUsers, login, register, getProfile };