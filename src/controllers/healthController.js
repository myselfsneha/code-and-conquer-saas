const { verifyDatabaseConnection } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');

async function health(req, res) {
  try {
    await verifyDatabaseConnection();
    return sendSuccess(res, 200, 'Server and DB are healthy');
  } catch (error) {
    return sendError(res, 500, 'Database connection failed');
  }
}

module.exports = { health };
