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
    api = jasmine.createSpyObj('api', ['openRoom']);
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
});
