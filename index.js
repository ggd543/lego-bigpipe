'use strict';

var ejs = require('ejs');
var metaTpl = '  <meta name="<%= name %>" content="<%= content %>">\n';
var styleLinkTpl = '  <link rel="stylesheet" type="text/css" href="<%= url %>">\n';
var styleTpl = '  <style><%- content %></style>\n';
var scriptLinkTpl = '  <script src="<%= url %>"></script>\n';
var scriptTpl = '  <script><%- content %></script>\n';

exports.unit = function (data) {
  var pagelet = {};
  var bigpipe = '';
  var quickling = '';
  pagelet.id = data.code;

  if (data.js) {
    pagelet.js = data.js;
    bigpipe = '<script>lego.onPageletArrive(' + JSON.stringify(pagelet) + ');</script>';
  }

  if (data.source && data.data) {
    pagelet.html = ejs.render(data.source, {locals: data.data});
  } else if (data.source) {
    pagelet.html = data.source;
  }

  if (pagelet.html) bigpipe = pagelet.html + bigpipe;

  if (data.css) pagelet.css = data.css;
  if (pagelet.html || pagelet.js || pagelet.css) {
    quickling = 'lego.onPageletArrive(' + JSON.stringify(pagelet) + ');';
  }

  if (bigpipe) bigpipe += '\n';
  if (quickling) quickling += '\n';

  return {
    code: data.code,
    bigpipe: bigpipe,
    quickling: quickling
  };
};

exports.view = function (data, config) {
  if (!data.code) data.code = uuid();

  var pre = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n';
  if (data.head) {
    // meta
    each(data.head.metas, function (meta) {
      pre += ejs.render(metaTpl, {locals: meta});
    });

    // title
    if (data.head.title) pre += '  <title>' + data.head.title + '</title>\n';

    // link[rel="stylesheet"], style
    each(data.head.styles, function (style) {
      pre += ejs.render(style.url ? styleLinkTpl : styleTpl,
        {locals: style});
    });

    // script[src], script
    each(data.head.scripts, function (script) {
      pre += ejs.render(script.url ? scriptLinkTpl : scriptTpl,
        {locals: script});
    });
  }

  // put units' css in head
  if (data.body) {
    var comboIds = {};
    each(data.body.units, function (unit) {
      each(unit.css, function (c) {
        comboIds[c] = 1;
      });
    });
    comboIds = Object.keys(comboIds);
    if (comboIds.length) {
      if (config.combo) {
        pre += ejs.render(scriptLinkTpl, {locals: {
          url: genUrl(comboIds, '.css.js', config)
        }});
      } else {
        each(comboIds, function (id) {
          pre += ejs.render(scriptLinkTpl, {locals: {
            url: genUrl(id, '.css.js', config)
          }});
        });
      }
    }
  }

  pre += '  </head>\n<body>\n';

  var post = '';
  if (data.body) {
    // link[rel="stylesheet"], style
    each(data.body.styles, function (style) {
      post += ejs.render(style.url ? styleLinkTpl : styleTpl,
        {locals: style});
    });

    // script[src], script
    each(data.body.scripts, function (script) {
      post += ejs.render(script.url ? scriptLinkTpl : scriptTpl,
        {locals: script});
    });
  }
  post += '</body>\n</html>';

  // replace __LEGO_CONFIG__ placeholder with config
  var configJSON = JSON.stringify(config);
  pre = pre.replace('__LEGO_CONFIG__', configJSON);
  post = post.replace('__LEGO_CONFIG__', configJSON);

  return {
    code: data.code,
    pre: pre,
    post: post
  };
};

function type(obj) {
  var t;
  if (obj == null) {
    t = String(obj);
  } else {
    t = Object.prototype.toString.call(obj).toLowerCase();
    t = t.substring(8, t.length - 1);
  }
  return t;
}

function each(obj, iterator, context) {
  if (typeof obj !== 'object') return;

  var i, l, t = type(obj);
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
}

function genUrl(ids, ext, config) {
  if (type(ids) === 'string') ids = [ids];
  else ids = ids.slice();
  ext = ext || '';
  each(ids, function (id, i) {
    ids[i] = id + ext;
  });

  var url = ids.length > 1 && config.comboPattern || config.urlPattern;
  if (url) url = url.replace('%s', ids.join(';'));
  return url;
}

// from jqMobi
function uuid() {
    function s4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}