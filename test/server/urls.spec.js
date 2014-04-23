describe('URLs', function () {
  var url = require('../../server/urls');
  it('should share room URLs with other modules', function () {
    expect(url.forRoom('abc')).toBe('/room/abc');
    expect(url.forRoom('def')).toBe('/room/def');
  });
  describe('inner working of routes', function () {
    var routes;
    var config;

    function expectRouteToRender(route, render, obj, req) {
      var renderFn = jasmine.createSpy('res.render');
      routes[route](req, {render: renderFn});
      if (obj) {
        expect(renderFn).toHaveBeenCalledWith(render, obj);
      } else {
        expect(renderFn).toHaveBeenCalledWith(render, {config: config});
      }
    }

    beforeEach(function () {
      routes = {};
      config = {
        port: 1000
      };
      url.init({
        param: function () {
        },
        get: jasmine.createSpy('app.get').andCallFake(function (name, callback) {
          routes[name] = callback;
        })
      }, config);

    });
    it('should setup home page', function () {
      expectRouteToRender('/', 'page');
    })
    it('should setup room page', function () {
      var room = {
        info: {}
      };
      expectRouteToRender('/room/:room', 'room', {room: room.info, config: config}, {room: room});
    });
  });
});
