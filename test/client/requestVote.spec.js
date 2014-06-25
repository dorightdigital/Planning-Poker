describe('Room Creator', function () {
  var ga;

  beforeEach(function () {
    module('pp');
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should track request to vote', function () {
    help.loadController('requestVote', {
      tracker: ga,
      scope: {newVote: {name: 'abc'}}
    }).$scope.submit();
    expect(ga.trackEvent).toHaveBeenCalledWith('request-vote', 'abc');
  });

});
