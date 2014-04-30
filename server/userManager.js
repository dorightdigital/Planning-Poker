var socketsByIndex = [];
var usersByIndex = [];
var usersByRef = {};
var guid = require('guid');

function createUser(socket) {
  var ref = guid.raw();
  var name;
  var rooms = [];
  var user;
  return user = {
    getRef: function () {
      return ref;
    },
    getName: function () {
      return name;
    },
    setName: function (newName) {
      name = newName;
    },
    participantRequest: function (user, room, name) {
      socket.emit('participant-request', { name : name, ref : user.getRef() })
    },
    accessGranted: function (roomRef) {
      rooms.push(roomRef)
      socket.emit('participant-approve', {
        roomRef: roomRef
      });
    },
    accessRefused: function (roomRef) {
      socket.emit('participant-reject', {
        roomRef: roomRef
      });
    },
    sendError: function (message) {
      socket.emit('error', message);
    },
    pushParticipantList: function (roomRef, list) {
      socket.emit('participant-update', {
        roomRef: roomRef,
        participants: list
      });
    },
    voteRequired: function (roomRef, taskRef, taskName) {
      socket.emit('vote-required', {
        roomRef: roomRef,
        taskRef: taskRef,
        taskName: taskName
      });
    },
    disconnect: function () {
      require('underscore').each(rooms, function (value) {
        var room = require('./roomManager').get(value);
        if (room) {
          room.actions.removeUser(user);
        } else {
          throw 'no room found';
        }
      });
    }
  };
}

exports.getFromRef = function (ref) {
  return usersByRef[ref];
}
exports.getFromSocket = function (socket) {
  var id = socketsByIndex.indexOf(socket);
  if (id === -1) {
    var user = createUser(socket);
    id = socketsByIndex.length;
    socketsByIndex[id] = socket;
    return usersByIndex[id] = usersByRef[user.getRef()] = user;
  }
  return usersByIndex[id];
};
