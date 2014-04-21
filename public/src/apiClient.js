define('apiClient', ['/socket.io/socket.io.js'], function (io) {
  var socket = io.connect(window.location.hostname, function () {

  });
  var roomRef;
  function logEvent(name) {
    socket.on(name, function (conf) {
      console.log('Received', name, conf);
    });
  }
  logEvent('participant-leave');
  logEvent('room-close');
  return {
    openRoom: function (name) {
      socket.emit('open-room', {name: name}, function (ref) {
        console.log('joining room', ref);
      });
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
      socket.on('error', fn);
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
    }
  }
});
