angular.module('pp')
  .controller('roomHost',function ($scope, $routeParams, api, tracker) {
    $scope.activePeople = {};
    var alreadyResponded = [];
    api.onConnect(function () {
      $('[ng-app]').removeClass('loading');
    });
    $scope.createRoom = function (roomName) {
      $('[ng-app]').addClass('loading');
      tracker.trackEvent('create-room', roomName);
      api.openRoom(roomName, function (room) {
        $('[ng-app]').removeClass('loading');
        var portString = window.location.port === '' ? '' : (':' + window.location.port);
        $scope.joinUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/participate/' + room.ref;
        $scope.roomName = roomName;
        $scope.roomReady = true;
        $scope.$apply();
      });
    };

    api.onJoinRequest(function (config) {
      $scope.pendingPeople = config.pendingParticipants;
      $scope.$apply();
    });
    $scope.accept = function (ref) {
      if (alreadyResponded.indexOf(ref) !== -1) {
        return;
      }
      tracker.trackEvent('participant-approved');
      $scope.allowVote = true;
      alreadyResponded.push(ref);
      api.acceptParticipant(ref);
    };
    $scope.reject = function (ref) {
      if (alreadyResponded.indexOf(ref) !== -1) {
        return;
      }
      tracker.trackEvent('participant-rejected');
      alreadyResponded.push(ref);
      api.rejectParticipant(ref);
    };
  }).controller('requestVote', function ($scope, $routeParams, api, tracker) {
    $scope.requestVote = function (voteName) {
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
    api.onFullVotingStatus(function (pending, voted) {
      $scope.voters = voted;
      $scope.$apply();
    });
  });
