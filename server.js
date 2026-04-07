const app = require('./src/app');
const env = require('./src/config/env');
const { verifyDatabaseConnection } = require('./src/config/db');

async function startServer() {
  try {
    await verifyDatabaseConnection();
    console.log('✅ MySQL Connected');

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect DB:', error.message);
    process.exit(1);
  }
}

startServer();
