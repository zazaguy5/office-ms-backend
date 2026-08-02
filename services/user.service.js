const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function fetchUsers() {
  try {
    const result = await pool.query('select * from users');
    return apiMsg(200, 'success', 'Get users success', { data: result.rows });
  } catch (error) {
    return apiMsg(400, 'failed', 'Failed to get users');
  }
}

async function login(username, password) {
  // เช็คบัญชีที่มาจาก request ว่ามีอยู่จริงหรือไม่
  const result = await pool.query('select * from users where users."accname" = $1', [username]);

  if (result.rows.length > 0) {
    const user = result.rows[0];
    //console.log(`Enter password: ${password}, User password: ${user.password}`);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return apiMsg(200, 'success', 'Login success', { userid: user.id, name: user.name });
    } else {
      return apiMsg(200, 'failed', 'Invalid password');
    }
  } else {
    return apiMsg(200, 'failed', 'Username not found');
  }
}

async function register(userDto) {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const { accname, password, name, sirname, department, position, startdate } = userDto;
  const hashedPassword = await hashPassword(password);
  //console.log(`formattedDate: ${formattedDate}, formattedTime: ${formattedTime}`);
  //console.log(`accname: ${accname}, password: ${password}, name: ${name}, sirname: ${sirname}, department: ${department}, position: ${position}, startdate: ${startdate}`);
  const existingUser = await pool.query('select "accname" from users where users."accname" = $1', [accname]);
  if (existingUser.rowCount === 0) {
    const result = await pool.query(
      'insert into users ("name", "accname", "password", "sirname", "department", "position", "startdate", "createddate", "createdtime") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
      [name, accname, hashedPassword, sirname, department, position, startdate, formattedDate, formattedTime]
    );
    if (!result) {
      return apiMsg(500, 'failed', 'Failed to register user');
    }

    return apiMsg(200, 'success', 'Created account');
  } else {
    return apiMsg(200, 'failed', 'Account already exists!');
  }
}

async function getProfile(userid) {
  // เช็คบัญชีที่มาจาก request ว่ามีอยู่จริงหรือไม่
  const result = await pool.query('select * from users where users."id" = $1', [userid]);

  if (result.rows.length > 0) {
    const user = result.rows[0];

    return apiMsg(200, 'success', 'Profile retrieved', { userid: user.id, name: user.name, accname: user.accname, sirname: user.sirname, role: user.role, department: user.department, position: user.position, startdate: user.startdate });
  } else {
    return apiMsg(200, 'failed', 'User not found');
  }
}

function apiMsg(code, status, message, data = null) {
  return { code: code, status: status, message: message, data: data };
}

async function hashPassword(password) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

module.exports = { fetchUsers, login, register, getProfile };