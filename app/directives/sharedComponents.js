angular.module('pp')
  .directive('guestlist', function () {
    return {
      restrict: 'E',
      templateUrl: '/app/views/guestList.html',
      controller: function ($scope, api) {
        $scope.remove = function (userRef) {
          api.removeUserFromRoom(userRef);
        };
        api.onParticipantUpdate(function (participantList) {
          $scope.guests = participantList;
          $scope.$apply();
        });
        api.onAccessRefused(function () {
          $scope.guests = [];
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
        var $title = $('<h2/>').addClass('voting-progress');
        var $container = $('<div/>').append($title).append(progress);
        api.onVotingProgressUpdate(function (percent) {
          progress.value=percent/100;
          updateTextTo(percent);
        });
        api.onRoomClose(function () {
          $element.text('');
        });
        $element.text('');
        updateTextTo(0);
        $element.append($container);

        function updateTextTo(percent) {
          $title.text('Voting progress: ' + Math.floor(percent) + '%').addClass('voting-progress');
        }
      }
    };
  });
