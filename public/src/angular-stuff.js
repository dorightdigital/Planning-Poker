var pp = angular.module('pp', [
  'ngRoute',
  'components'
]);

pp.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/partials/createRoom.html',
      controller: 'roomManager'
    }).when('/host/:roomRef', {
      templateUrl: 'app/partials/hostRoom.html',
      controller: 'roomHost'
    }).when('/participate/:roomRef', {
      templateUrl: 'app/partials/room.html',
      controller: 'roomParticipate'
    }).otherwise({
      templateUrl: 'app/partials/notFound.html'
    });
});

pp.controller('roomParticipate', function ($scope, $routeParams, api) {
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

pp.controller('roomHost', function ($scope, $routeParams, api) {
  $scope.activePeople = {};
  var portString = window.location.port === '' ? '' : (':' + window.location.port);
  var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + '/#/participate/' + $routeParams.roomRef;
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
pp.controller('requestVote', function ($scope, $routeParams, api) {
  $scope.submit = function () {
    api.requestVotes($scope.newVote.name);
  };
});

angular.module('components', [])
  .directive('qrcode', function () {
    return {
      scope: {
        'url': '@'
      },
      restrict: 'E',
      transclude: true,
      link: function ($scope, element) {
        function update() {
          element.text('');
          jQuery(element[0]).qrcode($scope.url);
        }

        update();
        $scope.$watch('url', function () {
          update();
        });
      }
    };
  })
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
