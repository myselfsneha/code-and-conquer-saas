function sendSuccess(res, statusCode, message, data = null, extra = {}) {
  return res.status(statusCode).json({ success: true, message, data, ...extra });
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { sendSuccess, sendError };
