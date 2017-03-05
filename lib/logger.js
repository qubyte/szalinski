'use strict';

const bunyan = require('bunyan');
const config = require('./config');

// Work around for an issue with bunyans response logger.
function logResponse(res) {
  if (!res || !res.statusCode) {
    return res;
  }

  return {
    statusCode: res.statusCode,
    header: res._headers || res._header // eslint-disable-line no-underscore-dangle
  };
}

module.exports = bunyan.createLogger({
  name: 'szalinski',
  level: config.SZALINSKI_LOG_LEVEL,
  serializers: Object.assign({}, bunyan.stdSerializers, { res: logResponse })
});
