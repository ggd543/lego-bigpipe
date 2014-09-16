'use strict';

var path = require('path');
var log4js = require('log4js');

log4js.loadAppender('dateFile');
log4js.addAppender(log4js.appenderMakers.dateFile({
  filename: 'lego',
  pattern: '.yyyyMMddhh.log',
  alwaysIncludePattern: true
}, {
  cwd: path.join(process.cwd(), 'private/log')
}), 'lego');

log4js.addAppender(log4js.appenders.console(), 'lego');

var logger = module.exports = log4js.getLogger('lego');
logger.setLevel('warn');