var socketsByIndex = [];
var usersByIndex = [];
var usersByRef = {};
var guid = require('guid');

function createUser(socket) {
  var ref = guid.raw();
  return {
    getRef: function () {
      return ref;
    },
    participantRequest: function (user, room, name) {
      socket.emit('participant-request', { name : name, ref : user.getRef() })
    },
    accessGranted: function (roomRef) {
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
