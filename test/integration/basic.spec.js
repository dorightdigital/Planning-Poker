var Browser = require("zombie");

function fakeWindowClose(guest) {
  guest.reload();
}
describe('app', function () {

  function openBrowserWindow(location, fn) {
    setTimeout(function () {
      var browser = new Browser();
      var fullLocation = location.indexOf('http') === 0 ? location : ("http://localhost:7901" + location);
      browser.visit(fullLocation, function () {
        fn(browser);
      });
    }, 500);
  }

  function createRoom(roomName, callback) {
    openBrowserWindow("/", function (currentBrowser) {
      currentBrowser
        .fill('#roomName', roomName)
        .pressButton('Create Room My room', function () {
          setTimeout(function () {
            callback(currentBrowser);
          }, 200);
        });
    });
  }

  describe('hosting a room', function () {

    it('should open a room', function (done) {
      createRoom('My room', function (currentBrowser) {
        expect(currentBrowser.text('.main h1')).toBe('Hosting room My room');
        done();
      });
    });
  });

  describe('visiting a hosted room', function () {

    it('should send request to join a room', function (done) {
      createRoom('My room', function (host) {
        openBrowserWindow(host.link('#joinLink').href, function (guest) {
          expect(guest.text('.main h1')).toBe('Join room My room');
          guest.fill('#name', 'abc').pressButton('Join');
          expect(guest.text('.main h1')).toBe('Waiting to see if you are allowed into My room');
          setTimeout(function () {
            expect(host.text('.pendingPeople .name')).toBe('abc');
            done();
          }, 200);
        });
      });
    });
    it('should send remove request to join a room on disconnect', function (done) {
      createRoom('My room', function (host) {
        openBrowserWindow(host.link('#joinLink').href, function (guest) {
          guest.fill('#name', 'abc').pressButton('Join');
          fakeWindowClose(guest);
          expect(host.text('.pendingPeople .name')).toBe('');
          done();
        });
      });
    });
  });
});
