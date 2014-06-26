describe('Room Creator', function () {

  beforeEach(function () {
    module('pp');
  });

  it('should request to open a room', function () {
    var controller = openRoomWithName('abc');
    expect(controller.api.openRoom).toHaveBeenCalledWith('abc', jasmine.any(Function));
  });

  it('should track room opening', function () {
    var controller = openRoomWithName('def');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('create-room', 'def');
  });

  it('should remove loading flag when API is ready', function () {
    var rootElem = $('<div ng-app class=loading/>').appendTo('body');
    var controller = help.loadController('roomHost');
    expect(rootElem.hasClass('loading')).toBeTruthy();
    controller.api.callbacks.connect();
    expect(rootElem.hasClass('loading')).toBeFalsy();
    rootElem.remove();
  });

  function openRoomWithName(roomName) {
    var controller = help.loadController('roomHost');
    controller.$scope.createRoom(roomName);
    return controller;
  }
});
