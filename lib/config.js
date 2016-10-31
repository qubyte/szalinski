'use strict';

module.exports = require('konfiga')({
  appPort: {
    defaultValue: 8080,
    envVariableName: 'SZALINSKI_APP_PORT',
    cmdLineArgName: 'app-port',
    type: Number
  },
  logLevel: {
    defaultValue: 'debug',
    envVariableName: 'SZALINSKI_LOG_LEVEL',
    cmdLineArgName: 'log-level',
    type: String
  },
  redisHost: {
    defaultValue: '127.0.0.1',
    envVariableName: 'SZALINSKI_REDIS_HOST',
    cmdLineArgName: 'redis-host',
    type: String
  },
  redisPort: {
    defaultValue: 6379,
    envVariableName: 'SZALINSKI_REDIS_PORT',
    cmdLineArgName: 'redis-port',
    type: Number
  }
});
