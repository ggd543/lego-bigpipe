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

/**
 * @param {string} data.code - 单元 code
 * @param {string[]} data.js - 单元 JS 依赖
 * @param {string[]} data.css - 单元 CSS 依赖
 * @param {string} data.source - 单元模板
 * @param {Object} data.data - 单元数据，用于渲染模板，是遵循 CommonJS 模块化规范的 JS 代码
 * @param {Object} data.config - 单元配置信息，例如统计信息等
 *
 * @returns {string} unit.id - uuid 单元构建标识
 * @returns {string} unit.code - 单元 code
 * @returns {string} unit.bigpipe - 单元 chunk 输出结果
 * @returns {string} unit.quickling - 单元在被异步请求时输出结果
 */
exports.unit = function (data) {
  var pagelet = {};
  var module = {};
  var bigpipe = '';
  var quickling = '';
  pagelet.id = uuid();
  pagelet.code = data.code;
  pagelet.unit = module.unit = data.config || {};

  if (data.data) {
    /*jshint evil: true */
    (new Function('module', 'var exports=module.exports={};' + data.data)).call(module, module);
  }

  if (data.js) {
    pagelet.js = data.js;
    bigpipe = '<script lego-id="' + pagelet.id + '">lego.onPageletArrive(' + JSON.stringify(pagelet) + ');</script>';
  }

  if (data.source) {
    pagelet.html = ejs.render(data.source, {locals: module.exports || {}});
    bigpipe = pagelet.html + bigpipe;
  }

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

/**
 * @param {string} data.code
 * @param {string} data.head.title
 * @param {string[]} data.head.styles
 * @param {string[]} data.head.scripts
 * @param {string[]} data.body.styles
 * @param {string[]} data.body.scripts
 * @param {Object[]} data.body.units
 *
 * @param {string} data.*.styles[].url
 * @param {string} data.*.styles[].content - view 中通过 <style> 内联的样式
 * @param {string} data.*.scripts[].url
 * @param {string} data.*.scripts[].content - view 中通过 <script> 内联的脚本
 *
 * @returns {string} view.code
 * @returns {string} view.pre - view chunk 输出单元前的部分
 * @returns {string} view.post - view chunk 输出单元后的部分
 */
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

/**
 * @param {string[]} ids - 要生成 url 的文件列表
 * @param {string} config.urlPattern - url 模式，使用 %s 占位符表示 id
 * @param {string} config.comboPattern - combo url 模式，使用 %s 占位符表示分号分割的多个 id
 * @returns {string[]} urls - 生成的 url/combo url 列表
 */
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