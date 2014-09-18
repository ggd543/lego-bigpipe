'use strict';

var path = require('path');
var mkdirp = require('mkdirp');

exports.type = function (obj) {
  var type;
  if (obj == null) {
    type = String(obj);
  } else {
    type = Object.prototype.toString.call(obj).toLowerCase();
    type = type.substring(8, type.length - 1);
  }
  return type;
};

exports.each = function (obj, iterator, context) {
  if (typeof obj !== 'object') return;

  var i, l, t = exports.type(obj);
  context = context || obj;
  if (t === 'array' || t === 'arguments' || t === 'nodelist') {
    for (i = 0, l = obj.length; i < l; i++) {
      if (iterator.call(context, obj[i], i, obj) === false) return;
    }
  } else {
    for (i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (iterator.call(context, obj[i], i, obj) === false) return;
      }
    }
  }
};

exports.isPlainObject = function (obj) {
  /*jshint noempty: false*/
  var key;
  var hasOwn = Object.prototype.hasOwnProperty;
  if (!obj || exports.type(obj) !== 'object') return false;
  if (obj.constructor &&
    !hasOwn.call(obj, 'constructor') &&
    !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false;
  }
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);
};

// from jQuery
exports.extend = function () {
  /*jshint forin: false*/
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;

  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    i = 2;
  }

  if (typeof target !== 'object' &&
    exports.type(target) !== 'function') target = {};

  if (length === i) {
    target = this;
    --i;
  }

  for (; i<length; i++) {
    if ((options = arguments[i]) != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];

        if (target === copy) continue;
        if (deep && copy && (exports.isPlainObject(copy) || (copyIsArray = exports.type(copy) === 'array'))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && exports.type(src) === 'array' ? src : [];
          } else {
            clone = src && exports.isPlainObject(src) ? src : {};
          }
          target[name] = exports.extend(deep, clone, copy);
        } else if (copy !== undefined) target[name] = copy;
      }
    }
  }
  return target;
};

exports.dir = function () {
  var dirPath = path.join.apply(path, arguments);
  mkdirp.sync(dirPath);
  return dirPath;
};