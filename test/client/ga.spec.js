describe('Google Analytics Wrapper', function () {
  var testScope;
  beforeEach(module('pp'));
  beforeEach(function () {
    if (!window.ga) {
      window.ga = function () {};
    }
    spyOn(window, 'ga');
    testScope = this;
  });
  beforeEach(inject(function (tracker) {
    testScope.subject = tracker;
  }));
  it('should send through event', function () {
    this.subject.trackEvent('a', 'b', 'c');
    expect(ga).toHaveBeenCalledWith('send', 'event', 'a', 'b', 'c');
  });
  it('should  not send values which are empty', function () {
    this.subject.trackEvent('a');
    expect(ga).toHaveBeenCalledWith('send', 'event', 'a');
  });
});
