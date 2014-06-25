describe('Room Creator', function () {
  var testScope, api, ga;
  function openRoomWithName(roomName) {
    help.loadController('roomManager', {
      api: api,
      tracker: ga,
      scope: {
        cr: {
          roomName: roomName
        }
      }
    });
    testScope.scope.createRoom();
  }

  beforeEach(function () {
    testScope = this;

    module('pp');
    api = jasmine.createSpyObj('api', ['openRoom', 'onConnect']);
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should request to open a room', function () {
    openRoomWithName('abc');
    expect(api.openRoom).toHaveBeenCalledWith('abc', jasmine.any(Function));
  });

  it('should track room opening', function () {
    openRoomWithName('def');
    expect(ga.trackEvent).toHaveBeenCalledWith('create-room', 'def');
  });

  it('should remove loading flag when API is ready', function () {
    var connectCallback;
    var rootElem = $('<div ng-app class=loading/>').appendTo('body');
    api.onConnect = function (fn) {
      connectCallback = fn;
    };
    help.loadController('roomManager', {
      api: api,
      tracker: ga
    });
    expect(rootElem.hasClass('loading')).toBeTruthy();
    connectCallback();
    expect(rootElem.hasClass('loading')).toBeFalsy();
    rootElem.remove();
  });
});
