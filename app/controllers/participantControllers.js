angular.module('pp').controller('roomParticipate', function ($scope, $routeParams, api, tracker) {

  var roomRef = $routeParams.roomRef;
  var currentVote;
  var votedFor = [];
  function setState(newState) {
    $scope.state = newState;
  }

  api.onConnect(function () {
    $('[ng-app]').removeClass('loading');
  });

  $scope.joinRoom = function (name) {
    tracker.trackEvent('join-room', name);
    setState('pending');
    api.joinRoom(roomRef, name)
      .onApprove(function () {
        setState('in-room');
        $scope.$apply();
      })
      .onReject(function () {
        setState('rejected');
        $scope.$apply();
      });
  };
  $scope.voteFor = function (value) {
    if (votedFor.indexOf(currentVote) !== -1) {
      return;
    }
    tracker.trackEvent('vote', value);
    votedFor.push(currentVote);
    api.vote(value, currentVote, roomRef);
    $scope.voted = true;
  };
  api.requestRoomDetails(roomRef, function (info) {
    $scope.roomName = info.name;
    $scope.$apply();
  });
  api.onVotingRequest(function (taskName, taskRef) {
    $scope.taskName = taskName;
    $scope.voted = false;
    currentVote = taskRef;
    setState('voting');
    $scope.$apply();
  });
  api.onRoomClose(function () {
    setState('closed');
    $scope.$apply();
  });
  api.onUnanimousResult(function (value) {
    currentVote = undefined;
    setState('unan-result');
    $scope.resultValue = value;
    $scope.$apply();
  });
  api.onMixedResult(function (results) {
    currentVote = undefined;
    setState('mixed-result');
    $scope.resultList = [];
    $.each(results, function (key, value) {
      $scope.resultList.push(key + ': ' + value.join(', '));
    });
    $scope.$apply();
  });

});
