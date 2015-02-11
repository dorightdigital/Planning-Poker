angular.module('pp').controller('roomParticipate', function ($scope, api, tracker) {

  var currentVote;
  var votedFor = [];
  function setState(newState) {
    $scope.state = newState;
  }

  api.onConnect(function () {
    $('[ng-app]').removeClass('loading');
  });


  $scope.icons = ('smiley happy tongue wink grin cool ' +
    'angry evil shocked confused neutral wondering').split(' ');
  $scope.currentIcon = $scope.icons[0];
  $scope.iconPickerDisplayed = false;
  $scope.setIcon = function (icon) {
    $scope.currentIcon = icon;
    console.log('Hiding', $scope.iconPickerDisplayed);
    $scope.iconPickerDisplayed = false;
    tracker.trackEvent('set-icon', icon);
  };
  $scope.togglePicker = function () {
    $scope.iconPickerDisplayed = !$scope.iconPickerDisplayed;
  }

  $scope.joinRoom = function (name, icon) {
    tracker.trackEvent('join-room', name);
    setState('pending');
    api.joinRoom($scope.roomRef, name, icon)
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
    api.vote(value, currentVote, $scope.roomRef);
    $scope.voted = true;
  };
  api.onVotingRequest(function (taskName, taskRef, values) {
    $scope.taskName = taskName;
    $scope.voted = false;
    $scope.availableVoteValues = values;
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
