describe('client', function () {
  it('should exist', function () {
    expect(function () {
      angular.module('pp');
    }).not.toThrow();
  });
});
