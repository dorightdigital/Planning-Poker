describe('Room Creator', function () {

  beforeEach(function () {
    module('pp');
  });

  it('should track request to vote', function () {
    var controller = help.loadController('requestVote', {
      scope: {newVote: {name: 'abc'}}
    });
    controller.$scope.submit();
    expect(controller.tracker.trackEvent).toHaveBeenCalledWith('request-vote', 'abc');
  });

});
