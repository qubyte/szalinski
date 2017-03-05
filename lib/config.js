'use strict';

module.exports = require('configeur')({
  SZALINSKI_APP_PORT: {
    defaultValue: '8080',
    type: 'number'
  },
  SZALINSKI_LOG_LEVEL: {
    defaultValue: 'debug'
  },
  SZALINSKI_REDIS_HOST: {
    defaultValue: '127.0.0.1'
  },
  SZALINSKI_REDIS_PORT: {
    defaultValue: '6379',
    type: 'number'
  }
});
