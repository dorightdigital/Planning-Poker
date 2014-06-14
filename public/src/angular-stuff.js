angular.module('pp', []);

angular.module('pp').controller('roomManager', function ($scope) {
  console.log('scope', $scope);
  $scope.createRoom = function () {
    var roomName = $scope.cr.roomName;
    apiClient.openRoom(roomName, function (room) {
      var portString = window.location.port === '' ? '' : (':' + window.location.port);
      var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + room.url;
      $scope.room = {
        name: roomName,
        url: fullRoomUrl,
        ready: true
      };
      console.log($scope.room);
      $scope.$apply();
    });
  }
});
