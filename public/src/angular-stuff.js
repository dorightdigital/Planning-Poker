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
      controller: 'roomJoin'
    }).when('/participate/:roomRef', {
      templateUrl: 'app/partials/room.html',
      controller: 'roomParticipate'
    }).when('/vote/:roomRef/:voteRef', {
      templateUrl: 'app/partials/vote.html',
      controller: 'roomVote'
    }).otherwise({
      templateUrl: 'app/partials/notFound.html'
    });
});

pp.controller('roomJoin', function ($scope, $routeParams, api) {
  api.requestRoomDetails($routeParams.roomRef, function (details) {
    $scope.roomName = details.name;
  });
});
pp.controller('roomVote', function ($scope, $routeParams, api) {
});
pp.controller('roomParticipate', function ($scope, $routeParams, api) {
  api.requestRoomDetails($routeParams.roomRef, function (info) {
    $scope.roomName = info.name;
    $scope.$apply();
  });
  api.onVotingRequest(function(conf) {
    window.location.href = '#/vote/' + $routeParams.roomRef + '/' + conf.voteRef;
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
      .onApprove(function () {
        window.location.href = '#/participate/' + $routeParams.roomRef;
      })
      .onReject(function () {
        window.location.href = '#/rejected';
      });
  };
});
pp.controller('requestVote', function ($scope, $routeParams, api) {
  $scope.submit = function () {
    api.requestVotes($scope.newVote.name);
  };
});

angular.module('components', [])
  .directive('qrcode', ['$document', function ( ) {
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
  }]);
