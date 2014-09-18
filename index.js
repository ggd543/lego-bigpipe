'use strict';

var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');
var app = module.exports = express();

process.on('uncaughtException', function (err) {
  (app.get('logger') || console).error('Uncaught exception:\n', err.stack);
});

app.set('port', process.env.PORT || 5000);
app.set('logger', require('./lib/logger'));
app.enable('trust proxy');

app.use(compress());
app.use(bodyParser.json());
app.use(require('./middleware/router')());
app.use(require('./middleware/error')());

if (require.main === module) {
  app.listen(app.get('port'), function () {
    console.log('[%s] Express server listening on port %d',
      app.get('env').toUpperCase(), app.get('port'));
  });
}