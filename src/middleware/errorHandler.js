const { sendError } = require('../utils/response');

function notFoundHandler(req, res) {
  return sendError(res, 404, 'Route not found');
}

function errorHandler(error, req, res, next) {
  console.error('Unhandled server error:', error.message);
  if (res.headersSent) {
    return next(error);
  }
  return sendError(res, 500, 'Something went wrong');
}

module.exports = { notFoundHandler, errorHandler };
