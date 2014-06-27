var help = help || {};

//help.lookupService = angular.injector([ 'pp' ]).get;

help.loadController = function (name, injections) {
  var params;
  inject(function ($rootScope, $controller) {
    params = help.setupDefaultParams && help.setupDefaultParams() || {};
    params.$scope = $rootScope.$new();
    for (var i in injections) {
      if (i === 'scope') {
        for (var j in injections[i]) {
          params.$scope[j] = injections[i][j];
        }
      } else {
        params[i] = injections[i];
      }
    }
    $controller(name, params);
  });
  return params;
};

help.addToScope = function (scope, stuff) {
  var i;
  for (i in stuff) {
    scope[i] = stuff[i];
  }
  scope.$apply();
};
