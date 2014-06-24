angular.module('pp').service('tracker', [function () {
  return {
    trackEvent: function () {
      var args = ['send', 'event'];
      angular.forEach(arguments, function (value) {
        args.push(value);
      });
      ga && ga.apply(window, args);
    }
  }
}]);
