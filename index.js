'use strict';

const http = require('http');
const app = require('./lib/app');
const logger = require('./lib/logger');
const config = require('./lib/config');

const server = http.createServer(app.requestHandler).listen(config.appPort, () => {
  logger.info(`listening on ${config.appPort}`);
});

function attemptGracefulExit(err, reason) {
  if (err) {
    logger.error({ err }, reason);
  } else {
    logger.warn(reason);
  }

  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 1000);
}

// There should be no unhandled promise rejections. Shut down if one occurs.
process.on('unhandledRejection', err => attemptGracefulExit(err, 'Unhandled Rejection.'));

// Explicit handling for signals from docker.
process.on('SIGINT', () => attemptGracefulExit(null, 'Process received SIGINT. Quitting...'));
process.on('SIGTERM', () => attemptGracefulExit(null, 'Process received SIGTERM. Quitting...'));
