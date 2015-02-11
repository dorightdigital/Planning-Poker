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
    world.guestBrowsersByName = world.guestBrowsersByName || {};
    openBrowserWindow(world.joinUrl, function (browser) {
      world.guestBrowsersByName[name] = browser;
      callback();
    });
  }

  function fullyJoinRoom(name, callback) {
    visitCurrentRoom(name, function () {
      joinRoom(name);
      acceptGuest(name, callback);
    });
  }

  function requestVoteOnTask(taskName, callback) {
    world.hostBrowser.fill('#voteName', taskName).pressButton('#requestVote');
    setTimeout(function () {
      callback();
    }, 300);
  }

  function joinRoom(name) {
    lookupGuestBrowser(name, true).fill('#name', name).pressButton('Join');
  }

  function userVotes(name, value, callback) {
    lookupGuestBrowser(name).pressButton('[vote-value="' + value + '"]');
    setTimeout(function () {
      callback();
    }, 1000);
  }

  function acceptGuest(name, callback) {
    setTimeout(function () {
      world.hostBrowser.pressButton('#pending [person-name="' + name + '"] button.accept');
      callback();
    }, 1000);
  }

  function lookupGuestBrowser(name) {
    if (name === 'I') {
      return world.hostBrowser;
    }
    var browser = world.guestBrowsersByName[name];
    if (!browser) {
      throw 'No browser for name ' + name + '.  Browsers are ' + _.keys(world.guestBrowsersByName).join(', ');
    }
    return browser;
  }

  function eachGuestBrowser(callback) {
    _.each(world.guestBrowsersByName, callback);
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
    joinRoom.call(this, name);
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
    }.bind(this), 300);
  });

  this.Then(/^I should see no participation requests/, function (callback) {
    assertEquals(world.hostBrowser.queryAll('.pendingPeople .name').length, 0, callback);
  });

  this.Given(/^(.*) joins the room$/, function(name, callback) {
    fullyJoinRoom(name, function () {
      setTimeout(callback, 500);
    }.bind(this));
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
      while (arg1 > 0) {
        fullyJoinRoom('Guest ' + arg1, callbackGenerator.getInstance());
        arg1--;
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

  this.When(/^I set the card deck to (.*)$/, function(cardList, callback) {
    world.hostBrowser.pressButton('.advanced-conf',function () {
      world.hostBrowser.fill('cardValues', cardList);
      callback();
    });
  });

  this.Then(/^all users should see vote progress as (.+)$/, function(arg1, callback) {
    setTimeout(function () {
      var expectedValue = 'Voting progress: ' + arg1;
      assertEquals(world.hostBrowser.text('.voting-progress'), expectedValue, callback);
      _.each(world.guestBrowsersByName, function (browser) {
        assertEquals(browser.text('.voting-progress'), expectedValue, callback);
      });
      callback();
    }.bind(this), 1000);
  });

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

  this.Then(/^(.*) should see icon "([^"]*)" for (.*) user "([^"]*)"$/, function(browserName, icon, list, name, callback) {
    setTimeout(function () {
      var browser = lookupGuestBrowser(browserName);
      var selector = '#' + list + ' [person-name="' + name + '"] .icon-' + icon;
      assertEquals(browser.queryAll(selector).length, 1, callback);
    }.bind(this), 1000);
  });

  this.Then(/^All users should see cards (.*)$/, function(cardList, callback) {
    var cards = cardList.split(',');
    var success = true;
    var output = '';
    eachGuestBrowser(function (browser){
      _.each(cards, function (value, key) {
        var text = browser.text('button[position="' + key + '"]');
        if (text !== value) {
          if (output.length > 0) {
            output += '\n';
          }
          output += 'expected position ' + (key+1) + ' to be ' + cards[key] + ' but was ' + text;
          success = false;
        }
      });
    });
    if (success) {
      callback();
    } else {
      callback.fail(output);
    }
  });

  function assertEquals(actual, expected, callback) {
    if (actual === expected) {
      callback();
    } else {
      callback.fail(new Error('expected ' + expected + ' but found ' + actual));
    }
  }

};
