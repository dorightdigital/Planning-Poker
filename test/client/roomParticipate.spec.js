describe('Room Creator', function () {
  var testScope, api, ga;

  beforeEach(function () {
    testScope = this;
    module('pp');
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should track request to join room', function () {
    help.loadController('roomParticipate', {
      tracker: ga
    });
    this.scope.joinRoom('abc');
    expect(ga.trackEvent).toHaveBeenCalledWith('join-room', 'abc');
  });

  it('should track vote action', function () {
    help.loadController('roomParticipate', {
      tracker: ga
    });
    this.scope.voteFor('3');
    expect(ga.trackEvent).toHaveBeenCalledWith('vote', '3');
  });
});
