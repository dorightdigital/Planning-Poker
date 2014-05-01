exports.init = function (server) {
  var io = require('socket.io').listen(server);
  var rooms = require('./roomManager');
  var users = require('./userManager');

  io.sockets.on('connection', function (socket) {
    var user = require('./userManager').getFromSocket(socket);
    function callWithRoomAndUser(config, fn) {
      var room = rooms.get(config.roomRef);
      if (!room) {
        user.sendError('Room not found "' + config.roomRef + '"');
        return;
      }
      var guest = users.getFromRef(config.userRef);
      if (!guest) {
        user.sendError('User not found "' + config.userRef + '"');
        return;
      }
      room.actions[fn](guest, user);
    }
//    var roomsUsedByCurrentSocket = {host: [], participant: []};
//    socket.on('disconnect', function () {
//      var participant = roomsUsedByCurrentSocket.participant;
//      var host = roomsUsedByCurrentSocket.host;
//      for (var i in  participant) {
//        if (participant.hasOwnProperty(i)) {
//          var room = participant[i];
//          var id = room.participants.approved.indexOf(socket) || room.participants.pending.indexOf(socket);
//          room.participants.host.socket.emit('participant-leave', {
//            ref: id
//          });
//        }
//      }
//      for (var i in  host) {
//        if (host.hasOwnProperty(i)) {
//          var room = host[i];
//          for (var j in room.participants.pending) {
//            if (room.participants.pending.hasOwnProperty(j)) {
//              room.participants.pending[j].socket.emit('room-close', {
//                ref: room.info.ref
//              });
//            }
//          }
//          for (var j in room.participants.approved) {
//            if (room.participants.approved.hasOwnProperty(j)) {
//              room.participants.approved[j].socket.emit('room-close', {
//                ref: room.info.ref
//              });
//            }
//          }
//        }
//      }
//    });
    socket.on('join-room', function (config) {
      var room = rooms.get(config.ref);
      user.setName(config.name);
      if (room) {
        room.actions.participantRequest(user);
      } else {
        socket.emit('error', 'Room not found "' + config.ref + '"');
      }
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
    socket.on('disconnect', function () {
      user.disconnect();
    });
    socket.on('request-voting-round', function (config) {
      var room = rooms.get(config.roomRef);
      if (!room) {
        user.sendError('Room not found "' + config.roomRef + '"');
        return;
      }
      room.actions.newVotingRound(config.name, user);
    });
  });
};
