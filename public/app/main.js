angular.module('pp', [
  'ngRoute',
  'participantControllers',
  'hostControllers',
  'sharedComponents',
  'comms'
]).config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/partials/createRoom.html',
      controller: 'roomManager'
    }).when('/host/:roomRef', {
      templateUrl: 'app/partials/hostRoom.html',
      controller: 'roomHost'
    }).when('/participate/:roomRef', {
      templateUrl: 'app/partials/room.html',
      controller: 'roomParticipate'
    }).otherwise({
      templateUrl: 'app/partials/notFound.html'
    });
});
