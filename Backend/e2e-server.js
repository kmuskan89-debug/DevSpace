/**
 * Dedicated E2E Test Server for DevSpace
 * Connects exclusively to an isolated test database: devspace_e2e_test
 * Runs on isolated port 5055 to prevent collisions with dev/production servers.
 */

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '5055';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/devspace_e2e_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'e2e-testing-jwt-secret-key-32-chars-long';

const http = require('http');
const mongoose = require('mongoose');
const connectDb = require('./db/db');
const app = require('./server');

// Health check endpoint for webServer readiness detection
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'test', db: 'devspace_e2e_test' });
});

let serverInstance = null;

async function startServer() {
  await connectDb();
  serverInstance = app.listen(process.env.PORT, () => {
    console.log(`[E2E Backend] Server listening on http://localhost:${process.env.PORT} (DB: devspace_e2e_test)`);
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  if (serverInstance) serverInstance.close();
  mongoose.connection.close();
});

process.on('SIGINT', () => {
  if (serverInstance) serverInstance.close();
  mongoose.connection.close();
});

startServer().catch((err) => {
  console.error('[E2E Backend] Failed to start test server:', err);
  process.exit(1);
});

