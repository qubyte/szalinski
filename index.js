'use strict';

const app = require('./lib/app');
const http = require('http');
const logger = require('./lib/logger');
const config = require('./lib/config');

const server = http.createServer(app.requestHandler).listen(config.appPort, () => {
  logger.info(`listening on ${config.appPort}`);
});

function attemptGracefulExit() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 1000);
}

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection.');
  attemptGracefulExit();
});

// Explicit handling for signals from docker.
process.on('SIGINT', () => {
  logger.warn('Process received SIGINT. Quitting...');
  attemptGracefulExit();
});

process.on('SIGTERM', () => {
  logger.warn('Process received SIGTERM. Quitting...');
  attemptGracefulExit();
});
