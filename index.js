'use strict';

var express = require('express');
var compress = require('compression');
var app = module.exports = express();
var middleware = ['bigpipe', 'error'];

middleware.forEach(function (m) {
  middleware.__defineGetter__(m, function () {
    return require('./middleware/' + m);
  });
});

process.on('uncaughtException', function (err) {
  (app.get('logger') || console).error('Uncaught exception:\n', err.stack);
});

app.set('port', process.env.PORT || 5000);
app.set('logger', require('./lib/logger'));
app.enable('trust proxy');

app.use(compress());
app.use(middleware.bigpipe());
app.use(middleware.error());

if (require.main === module) {
  app.listen(app.get('port'), function () {
    console.log('[%s] Express server listening on port %d',
      app.get('env').toUpperCase(), app.get('port'));
  });
}