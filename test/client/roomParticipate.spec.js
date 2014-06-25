describe('Room Creator', function () {
  var ga;

  beforeEach(function () {
    module('pp');
    ga = jasmine.createSpyObj('GA', ['trackEvent']);
  });

  it('should track request to join room', function () {
    help.loadController('roomParticipate', {
      tracker: ga
    }).$scope.joinRoom('abc');
    expect(ga.trackEvent).toHaveBeenCalledWith('join-room', 'abc');
  });

  it('should track vote action', function () {
    help.loadController('roomParticipate', {
      tracker: ga
    }).$scope.voteFor('3');
    expect(ga.trackEvent).toHaveBeenCalledWith('vote', '3');
  });

  it('should remove loading flag when API is ready', function () {
    var connectCallback;
    var rootElem = $('<div ng-app class=loading/>').appendTo('body');
    var api = help.createMockApi();
    api.onConnect = function (fn) {
      connectCallback = fn;
    };
    help.loadController('roomParticipate', {
      tracker: ga,
      api: api
    });
    expect(rootElem.hasClass('loading')).toBeTruthy();
    connectCallback();
    expect(rootElem.hasClass('loading')).toBeFalsy();
    rootElem.remove();
  });
});
