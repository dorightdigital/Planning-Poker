var zombie = require('zombie');
var _ = require('lodash');

module.exports = function () {
  var world = this.World = require("../support/world.js").World;

  this.Given = this.Then = this.defineStep;


  function openBrowserWindow(location, fn) {
    var browser = new zombie();
    if (browser.installStubCanvas) {
      browser.installStubCanvas();
    }
    var fullLocation = location.indexOf('http') === 0 ? location : ("http://localhost:7801" + location);
    browser.visit(fullLocation, function () {
      fn(browser);
    });
  }

  function createRoom(roomName, callback) {
    openBrowserWindow("/", function (currentBrowser) {
      currentBrowser
        .fill('#roomName', roomName)
        .pressButton('Create Room', function () {
          world.hostBrowser = currentBrowser;
          world.joinUrl = currentBrowser.text('#joinLink');
          callback();
        });
    });
  }

  function visitCurrentRoom(name, callback) {
    world.guestBrowsersByName = world.guestBrowsersByName || [];
    openBrowserWindow(world.joinUrl, function (browser) {
      world.guestBrowsersByName[name] = browser;
      callback();
    });
  }

  function fullyJoinRoom(name, callback) {
    visitCurrentRoom(name, function () {
      joinRoomWithName(name);
      acceptGuest(name, callback);
    });
  }

  function requestVoteOnTask(taskName, callback) {
    world.hostBrowser.fill('#voteName', taskName).pressButton('#requestVote');
    setTimeout(function () {
      callback();
    }, 300);
  }

  function joinRoomWithName(name) {
    lookupGuestBrowser(name, true).fill('#name', name).pressButton('Join');
  }

  function userVotes(name, value, callback) {
    lookupGuestBrowser(name).pressButton('[vote-value="' + value + '"]');
    setTimeout(function () {
      callback();
    }, 300);
  }

  function acceptGuest(name, callback) {
    setTimeout(function () {
      world.hostBrowser.pressButton('button.accept[person-name="' + name + '"]');
      callback();
    }, 300);
  }

  function lookupGuestBrowser(name) {
    if (name === 'I') {
      return world.hostBrowser;
    }
    var browser = world.guestBrowsersByName[name];
    if (!browser) {
      throw 'No browser for name ' + name;
    }
    return browser;
  }

  this.Given(/^I create room "([^"]*)"$/, function (name, callback) {
    createRoom(name, callback);
  });

  this.Given(/^I create a room$/, function (callback) {
    createRoom('My Room', callback);
  });

  this.When(/^(.*) visits room$/, function (name, callback) {
    visitCurrentRoom(name, callback);
  });

  this.When(/^(.*) requests access$/, function (name, callback) {
    joinRoomWithName(name);
    setTimeout(function () {
      callback();
    }, 1000);
  });

  this.When(/^(.*) disconnects/, function (name, callback) {
    lookupGuestBrowser(name).evaluate('forceDisconnect();');
    setTimeout(callback, 500);
  });

  this.When(/^(.*) votes (\d+)$/, function(name, value, callback) {
    userVotes(name, value, callback);
  });

  this.defineStep(/^after (\d+) seconds$/, function(arg1, callback) {
    setTimeout(callback, arg1*1000);
  });

  this.Then(/^(.*) should see vote summary "([^"]*)"$/, function (name, expectedTitle, callback) {
    assertEquals(lookupGuestBrowser(name).text('.main .vote-summary'), expectedTitle, callback);
  });

  this.Then(/^(.*) should see title "([^"]*)"$/, function (name, title, callback) {
    assertEquals(lookupGuestBrowser(name).text('.main h1'), title, callback);
  });

  this.Then(/^I should see participation request for (.*)/, function (expectedName, callback) {
    setTimeout(function () {
      assertEquals(world.hostBrowser.text('.pendingPeople .name'), expectedName, callback);
    }, 300);
  });

  this.Then(/^I should see no participation requests/, function (callback) {
    assertEquals(world.hostBrowser.queryAll('.pendingPeople .name').length, 0, callback);
  });

  this.Given(/^(.*) joins the room$/, function(name, callback) {
    fullyJoinRoom(name, callback);
  });

  this.When(/^I request a vote for task "([^"]*)"$/, function(taskName, callback) {
    requestVoteOnTask(taskName, callback);
  });

  this.Then(/^(.*) should be requested to vote$/, function(name, callback) {
    var expected = 'Vote on ';
    assertEquals(lookupGuestBrowser(name).text('main h1').substr(0, expected.length), expected, callback);
  });

  this.Given(/^I create a room with (\d+) users$/, function(arg1, callback) {
    createRoom('My Room', function () {
      var callbackGenerator = new ChainedDeferred(callback);
      while (arg1-- > 0) {
        fullyJoinRoom('Guest ' + arg1, callbackGenerator.getInstance());
      }
      callbackGenerator.configComplete();
    });
  });

  this.When(/^I request a vote$/, function(callback) {
    requestVoteOnTask('A Task', callback);
  });

  this.When(/^(\d+) users vote (\d+)$/, function(arg1, arg2, callback) {
    var i = 1;
    var deferred = new ChainedDeferred(callback);
    while (i <= arg1) {
      userVotes("Guest " + i++, arg2, deferred.getInstance());
    }
    deferred.configComplete();
  });

  this.Then(/^all users should see vote progress as (.+)$/, function(arg1, callback) {
    setTimeout(function () {
      var expectedValue = 'Voting progress: ' + arg1;
      assertEquals(world.hostBrowser.text('.voting-progress'), expectedValue, callback);
      _.each(world.guestBrowsersByName, function (browser) {
        assertEquals(browser.text('.voting-progress'), expectedValue, callback);
      });
      callback();
    }, 1000);
  });

  function assertEquals(actualTitle, expectedTitle, callback) {
    if (actualTitle === expectedTitle) {
      callback();
    } else {
      callback.fail(new Error('expected ' + expectedTitle + ' but found ' + actualTitle));
    }
  }

  function ChainedDeferred(callback) {
    var that = this;
    that.i = 1;
    function callbackWrapper() {
      that.i--;
      if (that.i === 0) {
        return callback.apply(null, arguments);
      }
    }
    that.getInstance = function () {
      that.i++;
      return callbackWrapper;
    };
    that.configComplete = callbackWrapper;
  }
};
