xdescribe('Google Analytics Wrapper', function () {
  beforeEach(function () {
    if (!window.ga) {
      window.ga = function () {};
    }
    spyOn(window, 'ga');
    this.subject = help.lookupService( 'tracker' );
  });
  it('should send through event', function () {
    this.subject.trackEvent('a', 'b', 'c');
    expect(ga).toHaveBeenCalledWith('send', 'event', 'a', 'b', 'c');
  });
  it('should  not send values which are empty', function () {
    this.subject.trackEvent('a');
    expect(ga).toHaveBeenCalledWith('send', 'event', 'a');
  });
});
