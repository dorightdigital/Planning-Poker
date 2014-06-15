angular.module('hostControllers', []).controller('roomHost', function ($scope, $routeParams, api) {
  $scope.activePeople = {};
  var portString = window.location.port === '' ? '' : (':' + window.location.port);
  var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/participate/' + $routeParams.roomRef;
  api.onError(function (msg) {
    if (msg.indexOf('Room not found') === 0) {
      window.location.href = "#/";
    }
  });
  api.requestRoomDetails($routeParams.roomRef, function (details) {
    $scope.roomName = details.name;
    $scope.joinUrl = fullRoomUrl;
    $scope.$apply();
  });
  api.onJoinRequest(function (config) {
    console.log(config);
    $scope.pendingPeople = config.pendingParticipants;
    $scope.$apply();
  });
  $scope.accept = function (ref) {
    api.acceptParticipant(ref);
  };
  $scope.reject = function (ref) {
    api.rejectParticipant(ref);
  };
}).controller('roomManager', function ($scope, api) {
    console.log('scope', $scope);
    $scope.createRoom = function () {
      var roomName = $scope.cr.roomName;
      api.roomName = roomName;
      api.openRoom(roomName, function (room) {
        window.location.href = '#/host/' + room.ref;
      });
    };
  }).controller('requestVote', function ($scope, $routeParams, api) {
    $scope.submit = function () {
      api.requestVotes($scope.newVote.name);
    };
  });
