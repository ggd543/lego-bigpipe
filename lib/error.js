'use strict';

var ERROR = {
  E_PARAM_ERR: {
    code: '10001',
    message: '请求参数错误'
  },
  E_REACT_ERR: {
    code: '20001',
    message: '构建过程异常'
  }
};

module.exports = function (name, message) {
  var e = ERROR[name] || {
    code: '-1',
    message: '未知错误'
  };

  return {
    status: 'fail',
    error: {
      code: e.code,
      message: message || e.message
    }
  };
};