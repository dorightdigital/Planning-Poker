describe('Room Participation', function () {

  beforeEach(function () {
    module('pp');
  });

  it('should track request to join room', function () {
    var controller = help.loadController('roomParticipate');
    controller.$scope.joinRoom('abc');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('join-room', 'abc');
  });

  it('should track vote action', function () {
    var controller = help.loadController('roomParticipate');
    controller.$scope.voteFor('3');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('vote', '3');
  });

  it('should remove loading flag when API is ready', function () {
    var rootElem = $('<div ng-app class=loading/>').appendTo('body');
    var controller = help.loadController('roomParticipate');
    expect(rootElem.hasClass('loading')).toBeTruthy();
    controller.api.callbacks.connect();
    expect(rootElem.hasClass('loading')).toBeFalsy();
    rootElem.remove();
  });
});
