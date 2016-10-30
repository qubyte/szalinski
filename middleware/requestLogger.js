'use strict';

const uuid = require('uuid');
const logger = require('../lib/logger');

function requestLogger(req) {
  const id = uuid.v4();
  const childLogger = logger.child({ uuid: id });

  this.set('uuid', id);
  this.set('logger', childLogger);

  childLogger.debug({ req }, 'Incoming request.');
}


module.exports = requestLogger;
