angular.module('pp').service('api', [function () {
  var wsHost = 'ws://' + window.location.hostname + (window.config && window.config.port ? ':' + window.config.port : '');
  var socket = io.connect(wsHost, function () {

  });
  var roomRef;

  function logEvent(name) {
    socket.on(name, function (conf) {
      console.log('Received', name, conf);
    });
  }

  logEvent('server-error');
  var self = {
    openRoom: function (name, callback) {
      socket.emit('open-room', {name: name});
      if (callback) {
        self.onRoomReady(callback);
      }
    },
    onRoomReady: function (fn) {
      socket.on('room-ready', function (config) {
        roomRef = config.ref;
        fn(config);
      });
    },
    joinRoom: function (ref, name) {
      roomRef = ref;
      socket.emit('join-room', {ref: ref, name: name});
      var output = {
        onApprove: function (fn) {
          socket.on('participant-approve', fn);
          return output;
        },
        onReject: function (fn) {
          socket.on('participant-reject', fn);
          return output;
        }
      };
      return output;
    },
    onJoinRequest: function (fn) {
      socket.on('participant-request', fn);
    },
    onError: function (fn) {
      socket.on('server-error', fn);
    },
    onRoomClose: function (fn) {
      socket.on('room-closed', fn);
    },
    acceptParticipant: function (ref) {
      socket.emit('participant-accept', {
        userRef: ref,
        roomRef: roomRef
      });
    },
    rejectParticipant: function (ref) {
      socket.emit('participant-reject', {
        userRef: ref,
        roomRef: roomRef
      });
    },
    requestVotes: function (name) {
      socket.emit('request-voting-round', {
        name: name,
        roomRef: roomRef
      });
    },
    onVotingRequest: function (fn) {
      socket.on('vote-required', function (config) {
        if (config.roomRef === roomRef) {
          fn(config.taskName, config.taskRef);
        }
      });
    },
    vote: function (vote, taskRef, roomRef) {
      socket.emit('vote', {
        roomRef: roomRef,
        taskRef: taskRef,
        value: vote
      });
    },
    onParticipantUpdate: function (fn) {
      socket.on('participant-update', function (data) {
        if (data.roomRef === roomRef) {
          fn(data.participants);
        }
      });
    },
    onFullVotingStatus: function (fn) {
      socket.on('full-voting-status', function (data) {
        fn(data.pending, data.voted);
      });
    },
    onVotingProgressUpdate: function (fn) {
      socket.on('voting-progress', function (data) {
        fn(data.progressPercentage);
      });
    },
    onUnanimousResult: function (fn) {
      socket.on('vote-result', function (data) {
        if (data.resultType === 'agreed') {
          fn(data.resultDetail);
        }
      });
    },
    onMixedResult: function (fn) {
      socket.on('vote-result', function (data) {
        if (data.resultType !== 'agreed') {
          fn(data.resultDetail);
        }
      });
    },
    onResult: function (fn) {
      socket.on('vote-result', function (data) {
        fn(data);
      });
    },
    requestRoomDetails: function (roomRef, fn) {
      socket.on('room-details', function (data) {
        fn(data);
      });
      socket.emit('ping-room-details', {roomRef: roomRef});
    }
  };
  return  self;
}]);
