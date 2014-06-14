var pp = angular.module('pp', [
  'ngRoute'
]);

pp.config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'app/partials/createRoom.html',
    controller: 'roomManager'
  }).when('/host/:roomRef', {
      templateUrl: 'app/partials/hostRoom.html',
      controller: 'roomHost'
    }).when('/join/:roomRef', {
      templateUrl: 'app/partials/joinRoom.html',
      controller: 'roomParticipate'
    }).otherwise({
      templateUrl: 'app/partials/notFound.html'
    });
});

pp.controller('roomParticipate', function ($scope, $routeParams) {
  apiClient.requestRoomDetails($routeParams.roomRef, function (details) {
    $scope.roomName = details.name;
  });
});
pp.controller('activeParticipants', function ($scope) {
  apiClient.onParticipantUpdate(function(participantList) {
    $scope.guests = participantList;
    $scope.$apply();
  });
});
pp.controller('roomHost', function ($scope, $routeParams) {
  $scope.activePeople = {};
  var portString = window.location.port === '' ? '' : (':' + window.location.port);
  var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/join/' + $routeParams.roomRef;
  apiClient.onError(function (msg) {
    if (msg.indexOf('Room not found') === 0) {
      window.location.href = "#/"
    }
  });
  apiClient.requestRoomDetails($routeParams.roomRef, function (details) {
    $scope.roomName = details.name;
    $scope.joinUrl = fullRoomUrl;
    $scope.$apply();
  });
  apiClient.onJoinRequest(function (config) {
    console.log(config);
    $scope.pendingPeople = config.pendingParticipants;
    $scope.$apply();
  });
  $scope.accept = function (ref) {
    apiClient.acceptParticipant(ref);
  };
  $scope.reject = function (ref) {
    apiClient.rejectParticipant(ref);
  };
});
pp.controller('roomManager', function ($scope) {
  console.log('scope', $scope);
  $scope.createRoom = function () {
    var roomName = $scope.cr.roomName;
    apiClient.roomName = roomName;
    apiClient.openRoom(roomName, function (room) {
      window.location.href = '#/host/' + room.ref;
    });
  }
});
pp.controller('roomJoiner', function ($scope, $routeParams) {
  $scope.joinRoom = function () {
    apiClient.joinRoom($routeParams.roomRef, $scope.join.name)
      .onApprove(function (info) {
        console.log('accept', info);
      })
      .onReject(function (info) {
        console.warn('reject', info)
      });
  }
});
