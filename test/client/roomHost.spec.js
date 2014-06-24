describe('Room Creator', function () {
  var ga;

  beforeEach(function () {
    module('pp');
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should track request to join room', function () {
    help.loadController('roomHost', {
      tracker: ga
    });
    this.scope.accept('userRef');
    expect(ga.trackEvent).toHaveBeenCalledWith('participant-approved');
  });

  it('should track request to join room', function () {
    help.loadController('roomHost', {
      tracker: ga
    });
    this.scope.reject('userRef');
    expect(ga.trackEvent).toHaveBeenCalledWith('participant-rejected');
  });

});
