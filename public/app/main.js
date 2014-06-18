angular.module('pp', [
  'ngRoute'
]).config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/views/createRoom.html',
      controller: 'roomManager'
    }).when('/host/:roomRef', {
      templateUrl: 'app/views/hostRoom.html',
      controller: 'roomHost'
    }).when('/participate/:roomRef', {
      templateUrl: 'app/views/room.html',
      controller: 'roomParticipate'
    }).otherwise({
      templateUrl: 'app/views/notFound.html'
    });
});
