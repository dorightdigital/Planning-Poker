var zombie = require('zombie');
require('../../../server/index.js');
exports.World = function (callback) {

  function openBrowserWindow(location, fn) {
    var browser = new zombie();
    setTimeout(function () {
      var fullLocation = location.indexOf('http') === 0 ? location : ("http://localhost:7801" + location);
      console.log('visiting ', fullLocation);
      browser.visit(fullLocation, function () {
        fn(browser);
      });
    }, 500);
  }

  function createRoom(roomName, callback) {
    console.log('creating room ', roomName);
    openBrowserWindow("/", function (currentBrowser) {
      currentBrowser
        .fill('#roomName', roomName)
        .pressButton('Create Room ' + roomName, function () {
          console.log('pressed room button');
          setTimeout(function () {
            callback(currentBrowser);
          }, 200);
        });
    });
  }

  callback({
    createRoom: createRoom,
    openBrowserWindow: openBrowserWindow
  });
};
