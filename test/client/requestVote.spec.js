describe('Room Creator', function () {
  var ga;

  beforeEach(function () {
    module('pp');
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should track request to join room', function () {
    help.loadController('requestVote', {
      tracker: ga,
      scope: {newVote: {name: 'abc'}}
    });
    this.scope.submit('abc');
    expect(ga.trackEvent).toHaveBeenCalledWith('request-vote', 'abc');
  });

});
