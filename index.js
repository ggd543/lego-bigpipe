'use strict';

var ejs = require('ejs');
var tpl = {
  meta: '  <meta name="<%= name %>" content="<%= content %>">\n',
  styleLink: '  <link rel="stylesheet" href="<%= url %>">\n',
  style: '  <style><%- content %></style>\n',
  scriptLink: '  <script src="<%= url %>"></script>\n',
  script: '  <script><%- content %></script>\n'
};

// pre-compile and cache templates
var tplCache = {};
each(tpl, function (t, name) {
  tpl.__defineGetter__(name, function () {
    return tplCache[name] ? tplCache[name] :
      (tplCache[name] = ejs.compile(t, {filename: name}));
  });
});

exports.unit = function (data) {
  var pagelet = {};
  var bigpipe = '';
  var quickling = '';
  pagelet.id = uuid();
  pagelet.code = data.code;

  if (data.js) {
    pagelet.js = data.js;
    bigpipe = '<script lego-id="' + pagelet.id + '">lego.onPageletArrive(' + JSON.stringify(pagelet) + ');</script>';
  }

  if (data.source && data.data) {
    var module = {exports: {}};
    /*jshint evil: true */
    (new Function('module', 'var exports=module.exports;' + data.data)).call(module, module);
    pagelet.html = ejs.render(data.source, {locals: module.exports});
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
    id: pagelet.id,
    code: data.code,
    bigpipe: bigpipe,
    quickling: quickling
  };
};

exports.view = function (data, config) {
  config = config || {urlPattern: '%s'};

  var pre = '<!DOCTYPE html>\n<!--STATUS OK-->\n<html>\n<head>\n  <meta charset="utf-8">\n';
  if (data.head) {
    // meta
    each(data.head.metas, function (meta) {
      pre += tpl.meta(meta);
    });

    // title
    if (data.head.title) pre += '  <title>' + data.head.title + '</title>\n';

    // link[rel="stylesheet"], style
    each(data.head.styles, function (style) {
      pre += tpl[style.url ? 'styleLink' : 'style'](style);
    });

    // script[src], script
    each(data.head.scripts, function (script) {
      pre += tpl[script.url ? 'scriptLink' : 'script'](script);
    });
  }

  if (data.body) {
    var ids = {css: {}, js: {}};
    each(data.body.units, function (unit) {
      each(unit.css, function (m) {ids.css[m + '.css.js'] = 1;});
      if (data.mode === 'inline') each(unit.js, function (m) {ids.js[m + '.js'] = 1;});
    });
    ids.css = Object.keys(ids.css);
    ids.js = Object.keys(ids.js);

    // inline mode: put mods' content in head
    if (data.mode === 'inline') {
      var mods = data.mods || {};
      for (var i = 0; i < ids.css.length; i++) {
        var id = ids.css[i];
        if (mods[id]) {
          pre += tpl.script({content: mods[id]});
          ids.css.splice(i--, 1);
        }
      }
      each(ids.js, function (id) {
        if (mods[id]) pre += tpl.script({content: mods[id]});
      });
    }

    // combo mode: put mods' url of css combo in head
    if (config.combo && ids.css.length) {
      pre += genUrl(ids.css, config).reduce(function (scripts, url) {
        return scripts += tpl.scriptLink({url: url});
      }, '');
    // put mods' url of css in head
    } else {
      each(ids.css, function (id) {
        pre += tpl.scriptLink({
          url: genUrl(id, config)
        });
      });
    }
  }

  pre += '</head>\n<body>\n';

  var post = '';
  if (data.body) {
    // link[rel="stylesheet"], style
    each(data.body.styles, function (style) {
      post += tpl[style.url ? 'styleLink' : 'style'](style);
    });

    // script[src], script
    each(data.body.scripts, function (script) {
      post += tpl[script.url ? 'scriptLink' : 'script'](script);
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

// from jqMobi
function uuid() {
  function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function genUrl(ids, config) {
  config = config || {};
  var urlPattern = config.urlPattern || '%s';
  if (type(ids) === 'string') return urlPattern.replace('%s', ids);
  else ids = ids.slice();

  urlPattern = config.comboPattern || urlPattern;
  var MAX_URL_LENGTH = 2000;
  var urls = [];
  var url = ids.shift();
  var l = urlPattern.length - 2 + url.length;

  while (ids.length) {
    var id = ids.shift();
    if (l + id.length < MAX_URL_LENGTH) {
      url += ';' + id;
      l += 1 + id.length;
    } else {
      urls.push(url);
      url = id;
      l = urlPattern.length - 2 + url.length;
    }
  }
  urls.push(url);

  return urls.map(function (url) {
    return urlPattern.replace('%s', url);
  });
}