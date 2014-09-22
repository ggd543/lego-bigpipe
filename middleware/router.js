'use strict';

var router = require('express').Router();

router.post('/view', require('../api/view'));
router.post('/unit', require('../api/unit'));

module.exports = function () {
  return router;
};