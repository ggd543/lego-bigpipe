'use strict';

var router = require('express').Router();
var reactor = require('../lib/reactor');
var error = require('../lib/error');
var app = require('../index');
var logger = app.get('logger') || console;

router.post('/view', require('../api/view'));
router.post('/unit', require('../api/unit'));

module.exports = function () {
  return router;
};