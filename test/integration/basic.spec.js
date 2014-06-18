var Browser = require("zombie");

describe('app', function () {

  function openBrowserWindow(fn, location) {
    location = location || "http://localhost:7901/";
    setTimeout(function () {
      var browser = new Browser();
      browser.visit(location, function () {
        fn(browser);
      });
    }, 500);
  }

  describe('hosting a room', function () {

    it('should open a room', function (done) {
      openBrowserWindow(function (currentBrowser) {
        currentBrowser
          .fill('#roomName', 'My room')
          .pressButton('Create Room My room', function () {
            expect(currentBrowser.text('h1')).toBe('Hosting room My room');
            done();
          });
      });
    });
  });

  describe('visiting a hosted room', function () {

    it('should join a room', function (done) {
      openBrowserWindow(function (parent) {
        parent
          .fill('#roomName', 'My room')
          .pressButton('Create Room My room', function () {
            openBrowserWindow(function (child) {
              expect(child.text('h1')).toBe('Join room My room');
              done();
            }, parent.link('#joinLink').href);
          });
      });
    });
  });

});
