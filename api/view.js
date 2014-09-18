'use strict';

var view = require('../lib/view');
var error = require('../lib/error');
var _ = require('../lib/util');

module.exports = function (req, res) {
  var data = req.param('data');
  if (_.type(data) !== 'object')
    return res.send(error('E_PARAM_ERR', '请求参数错误 [data]'));

  var meta = req.param('meta');
  if (_.type(meta) !== 'object')
    return res.send(error('E_PARAM_ERR', '请求参数错误 [meta]'));

  var result;
  try {
    result = view(data);
  } catch (e) {
    return res.send(error('E_REACT_ERR', e.message));
  }

  res.send({
    status: 'success',
    object: result
  });
};