angular.module('pp')
  .controller('roomHost',function ($scope, $routeParams, api) {
    $scope.activePeople = {};
    var portString = window.location.port === '' ? '' : (':' + window.location.port);
    var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/participate/' + $routeParams.roomRef;
    var alreadyResponded = [];
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
      $scope.pendingPeople = config.pendingParticipants;
      $scope.$apply();
    });
    $scope.accept = function (ref) {
      if (alreadyResponded.indexOf(ref) !== -1) {
        return;
      }
      $scope.allowVote = true;
      alreadyResponded.push(ref);
      api.acceptParticipant(ref);
    };
    $scope.reject = function (ref) {
      if (alreadyResponded.indexOf(ref) !== -1) {
        return;
      }
      alreadyResponded.push(ref);
      api.rejectParticipant(ref);
    };
  }).controller('roomManager',function ($scope, api, tracker) {
    $scope.createRoom = function () {
      var roomName = $scope.cr.roomName;
      tracker.trackEvent('create-room', roomName);
      api.openRoom(roomName, function (room) {
        window.location.href = '#/host/' + room.ref;
      });
    };
  }).controller('requestVote',function ($scope, $routeParams, api, tracker) {
    $scope.submit = function () {
      var voteName = $scope.newVote.name;
      tracker.trackEvent('request-vote', voteName)
      $scope.voteInProgress = true;
      $scope.result = 'pending';
      api.requestVotes(voteName);
    };
    api.onUnanimousResult(function (value) {
      $scope.voteInProgress = false;
      $scope.result = 'unan';
      $scope.resultValue = value;
      $scope.$apply();
    });
    api.onMixedResult(function (results) {
      $scope.voteInProgress = false;
      $scope.result = 'mixed';
      $scope.resultList = [];
      $.each(results, function (key, value) {
        $scope.resultList.push(key + ': ' + value.join(', '));
      });
      $scope.$apply();
    });
  }).controller('fullVotingStatus', function ($scope, api) {
    api.onFullVotingStatus(function (pending, voted) {
      $scope.voters = voted;
      $scope.$apply();
    });
  });
