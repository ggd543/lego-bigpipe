'use strict';

var path = require('path');
var fs = require('fs');
var proto = {};
var reactor = module.exports = Object.create(proto);
var reactors = [];

try {
  reactors = fs.readdirSync(path.join(__dirname, 'reactors'));
} catch (e) {}

reactors.forEach(function (r) {
  reactor.__defineGetter__(path.basename(r, '.js'), function () {
    return require('./reactors/' + r);
  });
});

proto.has = function (mode) {
  return this.hasOwnProperty(mode) && typeof this[mode] === 'function';
};