var help = help || {};

help.lookupService = angular.injector([ 'pp' ]).get;

help.loadController = function (name, injections) {
  return inject(function ($rootScope, $controller, $http, $httpBackend) {
    this.httpBackend = $httpBackend;
    this.scope = $rootScope.$new();
    var params = {
      '$scope': this.scope,
      '$http': $http
    };
    for (var i in injections) {
      if (i === 'scope') {
        for (var j in injections[i]) {
          this.scope[j] = injections[i][j];
        }
      } else {
        params[i] = injections[i];
      }
    }
    this.controller = $controller(name, params);
  });
};

help.addToScope = function (scope, stuff) {
  var i;
  for (i in stuff) {
    scope[i] = stuff[i];
  }
  scope.$apply();
};
