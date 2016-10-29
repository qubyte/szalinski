'use strict';

const Toisu = require('toisu');
const Router = require('toisu-router');
const http = require('http');

const logger = require('./lib/logger');

const requestLogger = require('./middleware/requestLogger');
const responseTime = require('./middleware/responseTime');
const parseAndValidateQuery = require('./middleware/parseAndValidateQuery');
const checkResizedInCache = require('./middleware/checkOriginalInCache');
const checkOriginalInCache = require('./middleware/checkOriginalInCache');
const imageRequest = require('./middleware/imageRequest');
const checkType = require('./middleware/checkType');
const resizeImage = require('./middleware/resizeImage');

function sendImage(req, res) {
  this.get('logger').debug('in sendImage');

  const buffer = this.get('resized-image-buffer');

  res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': buffer.length });
  res.end(buffer);
}

const app = new Toisu();
const router = new Router();

router.route('/image', {
  get: [
    parseAndValidateQuery,
    checkResizedInCache,
    checkOriginalInCache,
    imageRequest,
    checkType,
    resizeImage,
    sendImage
  ]
});

app.use(requestLogger);
app.use(responseTime);
app.use(router.middleware);

app.handleError = function (req, res, err) {
  logger.error({ err }, 'Error processing request.');
  Toisu.defaultHandleError.call(this, req, res, err);
};

const server = http.createServer(app.requestHandler).listen(3000, () => logger.info('listening'));

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
