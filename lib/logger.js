'use strict';

var path = require('path');
var log4js = require('log4js');
var util = require('./util');
var logDir = path.join(process.cwd(), 'private/log');

if (process.env.NODE_ENV === 'production') {
  util.dir(logDir);
  log4js.loadAppender('dateFile');
  log4js.addAppender(log4js.appenderMakers.dateFile({
    filename: 'lego',
    pattern: '.yyyyMMddhh.log',
    alwaysIncludePattern: true
  }, {cwd: logDir}), 'lego');
} else {
  log4js.addAppender(log4js.appenders.console(), 'lego');
}

module.exports = log4js.getLogger('lego');
module.exports.setLevel('warn');