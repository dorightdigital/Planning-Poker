angular.module('sharedComponents', [])
  .directive('guestlist', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/views/guestList.html',
      controller: function ($scope, api) {
        api.onParticipantUpdate(function (participantList) {
          $scope.guests = participantList;
          $scope.$apply();
        });
        api.onRoomClose(function () {
          $scope.guests = [];
          $scope.$apply();
        });
      }
    };
  })
  .directive('voteprogress', function () {
    return {
      restrict: 'E',
      controller: function ($element, api) {
        var progress = document.createElement('progress');
        api.onVotingProgressUpdate(function (percent) {
          progress.value=percent/100;
        });
        api.onRoomClose(function () {
          $element.text('');
        });
        $element.text('');
        $element.append(progress);
      }
    };
  });
