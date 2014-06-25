describe('Room Creator', function () {
  beforeEach(function () {
    module('pp');
  });

  it('should track participant approval', function () {
    var controller = help.loadController('roomHost');
    controller.$scope.accept('userRef');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('participant-approved');
  });

  it('should track participant rejection', function () {
    var controller = help.loadController('roomHost');
    controller.$scope.reject('userRef');
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('participant-rejected');
  });

});
