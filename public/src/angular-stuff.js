var pp = angular.module('pp', [
  'ngRoute',
  'components'
]);

pp.config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'app/partials/createRoom.html',
    controller: 'roomManager'
  }).when('/host/:roomRef', {
      templateUrl: 'app/partials/hostRoom.html',
      controller: 'roomHost'
    }).when('/join/:roomRef', {
      templateUrl: 'app/partials/joinRoom.html',
      controller: 'roomParticipate'
    }).otherwise({
      templateUrl: 'app/partials/notFound.html'
    });
});

pp.controller('roomParticipate', function ($scope, $routeParams, api) {
  api.requestRoomDetails($routeParams.roomRef, function (details) {
    $scope.roomName = details.name;
  });
});
pp.controller('activeParticipants', function ($scope, api) {
  api.onParticipantUpdate(function (participantList) {
    $scope.guests = participantList;
    $scope.$apply();
  });
});
pp.controller('roomHost', function ($scope, $routeParams, api) {
  $scope.activePeople = {};
  var portString = window.location.port === '' ? '' : (':' + window.location.port);
  var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/join/' + $routeParams.roomRef;
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
});
pp.controller('roomManager', function ($scope, api) {
  console.log('scope', $scope);
  $scope.createRoom = function () {
    var roomName = $scope.cr.roomName;
    api.roomName = roomName;
    api.openRoom(roomName, function (room) {
      window.location.href = '#/host/' + room.ref;
    });
  };
});
pp.controller('roomJoiner', function ($scope, $routeParams, api) {
  $scope.joinRoom = function () {
    api.joinRoom($routeParams.roomRef, $scope.join.name)
      .onApprove(function (info) {
        console.log('accept', info);
      })
      .onReject(function (info) {
        console.warn('reject', info);
      });
  };
});

angular.module('components', [])
  .directive('qrcode', ['$document', function ( ) {
    console.log('found');
    return {
      scope: {
        'url': '@'
      },
      restrict: 'E',
      transclude: true,
      link: function ($scope, element) {
        function update() {
          console.log('update', $scope.url);
          element.text('');
          jQuery(element[0]).qrcode($scope.url);
        }
        update();
        $scope.$watch('url', function () {
          update();
        });
      }
    };
  }]);
