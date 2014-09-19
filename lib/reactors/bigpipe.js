'use strict';

var ejs = require('ejs');
var logger = require('../logger');
var _ = require('../util');
var metaTpl = '  <meta name="<%= name %>" content="<%= content %>">\n';
var styleLinkTpl = '  <link rel="stylesheet" type="text/css" href="<%= url %>">\n';
var styleTpl = '  <style><%= content %></style>\n';
var scriptLinkTpl = '  <script src="<%= url %>">\n';
var scriptTpl = '  <script><%= content %></script>\n';

exports.unit = function (data) {
  var pagelet = {};
  pagelet.id = data.code;
  pagelet.js = data.js || [];

  var bigpipe = '<script>lego.onPageletArrive(' + JSON.stringify(pagelet) + ')</script>';

  if (data.source && data.data) {
    try {
      pagelet.html = ejs.render(data.source, {locals: data.data});
    } catch (e) {
      logger.error('[reactors/bigpipe.unit]' + e.stack);
      throw new Error('构建过程异常，模板渲染失败');
    }
  }

  if (pagelet.html) bigpipe = pagelet.html + bigpipe;

  pagelet.css = data.css || [];
  var quickling = 'lego.onPageletArrive(' + JSON.stringify(pagelet) + ');'

  return {
    code: data.code,
    bigpipe: bigpipe,
    quickling: quickling
  };
};

exports.view = function (data, config) {
  var pre, post;
  try {
    pre = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n';
    if (data.head) {
      // meta
      _.each(data.head.metas, function (meta) {
        pre += ejs.render(metaTpl, {locals: meta});
      });

      // title
      if (data.head.title) pre += '  <title>' + data.head.title + '</title>\n';

      // link[rel="stylesheet"], style
      _.each(data.head.styles, function (style) {
        pre += ejs.render(style.url ? styleLinkTpl : styleTpl,
          {locals: style});
      });

      // script[src], script
      _.each(data.head.scripts, function (script) {
        pre += ejs.render(script.url ? scriptLinkTpl : scriptTpl,
          {locals: script});
      });

      // TODO 生成全部单元 CSS 的 combo URL，构建 link 标签
    }
    pre += '  </head>\n<body>\n';

    post = '';
    if (data.body) {
      // link[rel="stylesheet"], style
      _.each(data.body.styles, function (style) {
        post += ejs.render(style.url ? styleLinkTpl : styleTpl,
          {locals: style});
      });

      // script[src], script
      _.each(data.body.scripts, function (script) {
        post += ejs.render(script.url ? scriptLinkTpl : scriptTpl,
          {locals: script});
      });
    }
    post += '</body>\n</html>';

    // replace __LEGO_CONFIG__ placeholder with config
    var configJSON = JSON.stringify(config);
    pre = pre.replace('__LEGO_CONFIG__', configJSON);
    post = post.replace('__LEGO_CONFIG__', configJSON);
  } catch (e) {
    logger.error('[reactors/bigpipe.view]' + e.stack);
    throw new Error('构建过程异常，模板渲染失败');
  }

  return {
    code: data.code,
    pre: pre,
    post: post
  };
};