define('apiClient', ['/socket.io/socket.io.js'], function (io) {
  var socket = io.connect('http://localhost:3700');
  var roomId;
  return {
    openRoom: function (name) {
      socket.emit('open-room', {name: name}, function (ref) {
        console.log('joining room', ref);
      });
    },
    onRoomReady: function (fn) {
      socket.on('room-ready', function (config) {
        roomId = config.ref;
        fn(config);
      });
    },
    joinRoom: function (id, name) {
      roomId = id;
      socket.emit('join-room', {id: id, name: name});
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
      socket.on('error', fn);
    },
    acceptParticipant: function (ref) {
      socket.emit('participant-accept', {
        ref: ref,
        roomId: roomId
      });
    },
    rejectParticipant: function (ref) {
      socket.emit('participant-reject', {
        ref: ref,
        roomId: roomId
      });
    },
  }
});
