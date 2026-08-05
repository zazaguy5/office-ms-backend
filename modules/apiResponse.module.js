function apiMsg(code, status, message, data = null) {
  return { code: code, status: status, message: message, data: data };
}

module.exports = { apiMsg };