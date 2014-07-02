module.exports = function () {
  var world = this.World = require("../support/world.js").World;

  this.Given = this.Then = this.defineStep;

  this.Given(/^I create room "([^"]*)"$/, function (arg1, callback) {
    this.createRoom(arg1, function (currentBrowser) {
      world.hostBrowser = currentBrowser;
      world.joinUrl = currentBrowser.text('#joinLink');
      callback();
    });
  });

  this.When(/^guest visits room$/, function (callback) {
    this.openBrowserWindow(world.joinUrl, function (browser) {
      world.guestBrowser = browser;
      callback();
    });
  });

  this.When(/^guest enters name "([^"]*)"$/, function (arg1, callback) {
    world.guestBrowser.fill('#name', arg1).pressButton('Join');
    callback();
  });

  this.When(/^guest disconnects/, function (callback) {
    world.guestBrowser.reload();
    callback();
  });

  this.defineStep(/^after (\d+) seconds$/, function(arg1, callback) {
    setTimeout(callback, arg1*1000);
  });

  this.Then(/^I should see title "([^"]*)"$/, function (expectedTitle, callback) {
    assertEquals(world.hostBrowser.text('.main h1'), expectedTitle, callback);
  });

  this.Then(/^guest should see title "([^"]*)"$/, function (arg1, callback) {
    assertEquals(world.guestBrowser.text('.main h1'), arg1, callback);
  });

  this.Then(/^host should see participation request for (.*)/, function (expectedName, callback) {
    setTimeout(function () {
      assertEquals(world.hostBrowser.text('.pendingPeople .name'), expectedName, callback);
    }, 300);
  });

  this.Then(/^host should see no participation requests/, function (callback) {
    setTimeout(function () {
      console.log('name: ',world.hostBrowser.text('.pendingPeople .name'));
      assertEquals(world.hostBrowser.queryAll('.pendingPeople .name').length, 0, callback);
    }, 6000);
  });

  function assertEquals(actualTitle, expectedTitle, callback) {
    if (actualTitle === expectedTitle) {
      callback();
    } else {
      callback.fail(new Error('expected ' + expectedTitle + ' but found ' + actualTitle));
    }
  }

};
