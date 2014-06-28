exports.init = function (server) {
  var io = require('socket.io').listen(server);
  var rooms = require('./roomManager');
  var users = require('./userManager');

  io.sockets.on('connection', function (socket) {
    var user = require('./userManager').getFromSocket(socket);


    function withSpecifiedRoom(ref, callback) {
      var room = rooms.get(ref);
      if (room) {
        callback(room);
      } else {
        user.sendError('Room not found "' + ref + '"');
      }
    }
    function callWithRoomAndUser(config, fn) {
      withSpecifiedRoom(config.roomRef, function (room) {
        var guest = users.getFromRef(config.userRef);
        if (!guest) {
          user.sendError('User not found "' + config.userRef + '"');
          return;
        }
        room.actions[fn](guest, user);
      });
    }

    socket.on('join-room', function (config) {
      user.setName(config.name);
      withSpecifiedRoom(config.ref, function (room) {
        room.actions.participantRequest(user);
      });
      user.setCurrentRoomRef(config.ref);
    });
    socket.on('open-room', function (config) {
      rooms.create(user, config.name);
    });
    socket.on('participant-accept', function (config) {
      callWithRoomAndUser(config, 'participantAccept');
    });
    socket.on('participant-reject', function (config) {
      callWithRoomAndUser(config, 'participantReject');
    });
    socket.on('remove-user', function (config) {
      callWithRoomAndUser(config, 'removeUser');
    });
    socket.on('disconnect', function () {
      user.disconnect();
    });
    socket.on('request-voting-round', function (config) {
      withSpecifiedRoom(config.roomRef, function (room) {
        room.actions.newVotingRound(config.name, user);
      });
    });
    socket.on('vote', function (config) {
      withSpecifiedRoom(config.roomRef, function (room) {
        room.actions.voteReceived(user, config.value, config.taskRef);
      });
    });
    socket.on('ping-room-details', function (config) {
      withSpecifiedRoom(config.roomRef, function (room) {
        user.roomDetails(room.info);
      });
    });
  });
};
