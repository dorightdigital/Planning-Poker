angular.module('sharedComponents', [])
  .directive('guestlist', function (api) {
    return {
      restrict: 'E',
      templateUrl: 'app/partials/guestList.html',
      controller: function ($scope, api) {
        api.onParticipantUpdate(function (participantList) {
          $scope.guests = participantList;
          $scope.$apply();
        });
      }
    };
  });
