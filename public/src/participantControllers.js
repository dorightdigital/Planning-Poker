angular.module('participantControllers', []).controller('roomParticipate', function ($scope, $routeParams, api) {
  function setState(newState) {
    $scope.state = newState;
  }

  $scope.joinRoom = function (name) {
    setState('pending');
    api.joinRoom($routeParams.roomRef, name)
      .onApprove(function () {
        setState('in-room');
        $scope.$apply();
      })
      .onReject(function () {
        setState('rejected');
        $scope.$apply();
      });
  };
  api.requestRoomDetails($routeParams.roomRef, function (info) {
    $scope.roomName = info.name;
    $scope.$apply();
  });
  api.onVotingRequest(function (conf) {
    $scope.vote = conf;
    setState('voting');
    $scope.$apply();
  });
});
