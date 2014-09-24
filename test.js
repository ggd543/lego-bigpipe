// (╯°□°)╯︵oƃǝ˥
var should = require('should');
var lego = require('./index');

describe('lego.unit', function () {
  it('should build unit and return bigpipe and quickling properly', function () {
    var u = {
      code: 'unit',
      js: ['c/c1/c1', 'c/c1/c11', 'c/c2/c2'],
      css: ['c/c1/c1', 'c/c2/c2'],
      source: '<h1><%= name %></h1>',
      data: {name: 'unit'}
    };
    var r = lego.unit(u);
    r.should.have.property('code', u.code);
    r.should.have.property('bigpipe', '<h1>unit</h1><script>lego.onPageletArrive({"id":"unit","js":["c/c1/c1","c/c1/c11","c/c2/c2"]})</script>');
    r.should.have.property('quickling', 'lego.onPageletArrive({"id":"unit","js":["c/c1/c1","c/c1/c11","c/c2/c2"],"html":"<h1>unit</h1>","css":["c/c1/c1","c/c2/c2"]});');
  });

  it('should build unit properly when unit only contain source', function () {
    var u = {
      code: 'unit',
      source: '<h1>Hello, world!</h1>'
    };
    var r = lego.unit(u);
    r.should.have.property('code', u.code);
    r.should.have.property('bigpipe', u.source);
    r.should.have.property('quickling', 'lego.onPageletArrive({"id":"unit","html":"<h1>Hello, world!</h1>"});');
  });

  it('should build unit properly when unit only contain js', function () {
    var u = {
      code: 'unit',
      js: ['c/c1/c1', 'c/c1/c11', 'c/c2/c2']
    };
    var r = lego.unit(u);
    r.should.have.property('code', u.code);
    r.should.have.property('bigpipe', '<script>lego.onPageletArrive({"id":"unit","js":["c/c1/c1","c/c1/c11","c/c2/c2"]})</script>');
    r.should.have.property('quickling', 'lego.onPageletArrive({"id":"unit","js":["c/c1/c1","c/c1/c11","c/c2/c2"]});');
  });

  it('should build unit properly when unit only contain css', function () {
    var u = {
      code: 'unit',
      css: ['c/c1/c1', 'c/c2/c2']
    };
    var r = lego.unit(u);
    r.should.have.property('code', u.code);
    r.should.have.property('bigpipe', '');
    r.should.have.property('quickling', 'lego.onPageletArrive({"id":"unit","css":["c/c1/c1","c/c2/c2"]});');
  });

  it('should build unit properly when unit contain nothing', function () {
    var u = {
      code: 'unit'
    };
    var r = lego.unit(u);
    r.should.have.property('code', u.code);
    r.should.have.property('bigpipe', '');
    r.should.have.property('quickling', '');
  });
});

describe('lego.view', function () {
  it('should build head.meta properly', function () {
    var v = lego.view({
      code: 'view',
      head: {
        metas: [{
          name: 'HandheldFriendly',
          content: true
        }, {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0'
        }]
      }
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <meta name="HandheldFriendly" content="true">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0">\n  </head>\n<body>\n');
  });

  it('should build head.title properly', function () {
    var v = lego.view({
      code: 'view',
      head: {
        title: 'Hello'
      }
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Hello</title>\n  </head>\n<body>\n');
  });

  it('should build head.styles properly', function () {
    var v = lego.view({
      code: 'view',
      head: {
        styles: [{
          url: 'a.css'
        }, {
          content: 'html { display: none; }'
        }]
      }
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" type="text/css" href="a.css">\n  <style>html { display: none; }</style>\n  </head>\n<body>\n');
  });

  it('should build head.scripts properly', function () {
    var v = lego.view({
      code: 'view',
      head: {
        scripts: [{
          url: 'a.js'
        }, {
          content: 'console.log(\'Hello\');'
        }]
      }
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <script src="a.js"></script>\n  <script>console.log(\'Hello\');</script>\n  </head>\n<body>\n');
  });

  it('should build body.styles properly', function () {
    var v = lego.view({
      code: 'view',
      body: {
        styles: [{
          url: 'a.css'
        }, {
          content: 'html { display: none; }'
        }]
      }
    });
    v.should.have.property('post', '  <link rel="stylesheet" type="text/css" href="a.css">\n  <style>html { display: none; }</style>\n</body>\n</html>');
  });

  it('should build body.scripts properly', function () {
    var v = lego.view({
      code: 'view',
      body: {
        scripts: [{
          url: 'a.js'
        }, {
          content: 'console.log(\'Hello\');'
        }]
      }
    });
    v.should.have.property('post', '  <script src="a.js"></script>\n  <script>console.log(\'Hello\');</script>\n</body>\n</html>');
  });

  it('should put units\' css in head properly when combo=false', function () {
    var v = lego.view({
      code: 'view',
      body: {
        units: [{
          code: 'unit1',
          css: ['u/u1/u11', 'u/u1/u12']
        }, {
          code: 'unit2',
          css: ['u/u2/u21', 'u/u2/u21', 'u/u1/u11']
        }]
      }
    }, {
      combo: false,
      urlPattern: '/%s',
      comboPattern: '/c/%s'
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" type="text/css" href="/u/u1/u11.css.js">\n  <link rel="stylesheet" type="text/css" href="/u/u1/u12.css.js">\n  <link rel="stylesheet" type="text/css" href="/u/u2/u21.css.js">\n  </head>\n<body>\n');
  });

  it('should put units\' css in head properly when combo=true', function () {
    var v = lego.view({
      code: 'view',
      body: {
        units: [{
          code: 'unit1',
          css: ['u/u1/u11', 'u/u1/u12']
        }, {
          code: 'unit2',
          css: ['u/u2/u21', 'u/u2/u21', 'u/u1/u11']
        }]
      }
    }, {
      combo: true,
      urlPattern: '/%s',
      comboPattern: '/c/%s'
    });
    v.should.have.property('pre', '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" type="text/css" href="/c/u/u1/u11.css.js;u/u1/u12.css.js;u/u2/u21.css.js">\n  </head>\n<body>\n');
  });
});