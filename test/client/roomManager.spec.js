describe('Room Creator', function () {
  var testScope, api, ga;
  function openRoomWithName(roomName) {
    var controller = help.loadController('roomManager', {
      api: api,
      scope: {
        cr: {
          roomName: roomName
        }
      }
    });
    controller.$scope.createRoom();
    return controller;
  }

  beforeEach(function () {
    testScope = this;

    module('pp');
    api = help.createMockApi();
  });

  it('should request to open a room', function () {
    openRoomWithName('abc');
    expect(api.openRoom).toHaveBeenCalledWith('abc', jasmine.any(Function));
  });

  it('should track room opening', function () {
    var controller = openRoomWithName('def');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('create-room', 'def');
  });

  it('should remove loading flag when API is ready', function () {
    var connectCallback;
    var rootElem = $('<div ng-app class=loading/>').appendTo('body');
    api.onConnect = function (fn) {
      connectCallback = fn;
    };
    help.loadController('roomManager', {
      api: api
    });
    expect(rootElem.hasClass('loading')).toBeTruthy();
    connectCallback();
    expect(rootElem.hasClass('loading')).toBeFalsy();
    rootElem.remove();
  });
});
