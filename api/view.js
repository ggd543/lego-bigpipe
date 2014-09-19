'use strict';

var reactor = require('../lib/reactor');
var error = require('../lib/error');
var _ = require('../lib/util');

module.exports = function (req, res) {
  var mode = req.param('mode');
  if (!reactor.has(mode))
    return res.send(error('E_PARAM_ERR', '请求参数错误 [mode]'));

  var data = req.param('data');
  if (_.type(data) !== 'object')
    return res.send(error('E_PARAM_ERR', '请求参数错误 [data]'));

  var meta = req.param('meta');
  if (_.type(meta) !== 'object')
    return res.send(error('E_PARAM_ERR', '请求参数错误 [meta]'));

  var result;
  try {
    result = reactor[mode].view(data, meta);
  } catch (e) {
    return res.send(error('E_REACT_ERR', e.message));
  }

  res.send({
    status: 'success',
    object: result
  });
};