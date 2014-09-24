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

describe('lego.view with combo=false', function () {

});

describe('lego.view with combo=true', function () {

});