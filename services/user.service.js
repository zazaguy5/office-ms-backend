const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function fetchUsers() {
  const result = await pool.query('select * from users');
  return result.rows;
}

async function login(username, password) {
  const result = await pool.query('select * from users where users."accName" = $1', [username]);
  const user = result.rows[0];
  console.log(`Enter password: ${password}, User password: ${user.password}`);
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (result.rows.length === 0 || !isPasswordValid) {
    throw new Error('Invalid username or password');
    return false;
  }
  return true;
}

async function register(userDto) {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  const { accName, password, name, sirname, department, position, startDate } = userDto;
  const hashedPassword = await hashPassword(password);
  //console.log(`user Account: ${accName}, password: ${hashedPassword}`);
  const existingUser = await pool.query('select "accName" from users where users."accName" = $1', [accName]);
  if (existingUser.rowCount > 0) {
    throw new Error('Account already exists');
  }
  const result = await pool.query(
    'insert into users ("name", "accName", "password", "sirname", "department", "position", "startDate", "createdDate", "createdTime") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
    [name, accName, hashedPassword, sirname, department, position, startDate, formattedDate, formattedTime]
  );
  if (!result) {
    throw new Error('Failed to register user');
    return false;
  }
  return true;
}

async function hashPassword(password) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

module.exports = { fetchUsers, login, register };