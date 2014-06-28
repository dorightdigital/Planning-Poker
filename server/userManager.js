var socketsByIndex = [];
var usersByIndex = [];
var usersByRef = {};
var guid = require('guid');

function createUser(socket) {
  var ref = guid.raw();
  var name;
  var currentRoomRef;
  var user = {
    getRef: function () {
      return ref;
    },
    getName: function () {
      return name;
    },
    setName: function (newName) {
      name = newName;
    },
    participantRequest: function (participants, room) {
      socket.emit('participant-request', {
        roomRef: room.info.ref,
        pendingParticipants: participants
      });
    },
    roomReady: function (room) {
      currentRoomRef = room.info.ref;
      socket.emit('room-ready', room.info);
    },
    setCurrentRoomRef: function (roomRef) {
      if (currentRoomRef) {
        user.disconnect();
      }
      currentRoomRef = roomRef;
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
      socket.emit('server-error', message);
    },
    pushParticipantList: function (roomRef, list) {
      socket.emit('participant-update', {
        roomRef: roomRef,
        participants: list
      });
    },
    roomClosed: function (room) {
      socket.emit('room-closed', {roomRef: 'ref'});
    },
    voteRequired: function (roomRef, taskRef, taskName) {
      socket.emit('vote-required', {
        roomRef: roomRef,
        taskRef: taskRef,
        taskName: taskName
      });
    },
    fullVotingStatus: function (voteRef, pending, voted) {
      socket.emit('full-voting-status', {
        pending: pending,
        voted: voted,
        voteRef: voteRef
      });
    },
    votingProgress: function (voteRef, progress) {
      socket.emit('voting-progress', {
        voteRef: voteRef,
        progressPercentage: progress * 100
      });
    },
    result: function (voteRef, type, detail) {
      socket.emit('vote-result', {
        voteRef: voteRef,
        resultType: type,
        resultDetail: detail
      });
    },
    roomDetails: function (roomInfo) {
      socket.emit('room-details', roomInfo);
    },
    disconnect: function () {
      if (!currentRoomRef) {
        return;
      }
      var roomObj = require('./roomManager').get(currentRoomRef);
      if (roomObj) {
        roomObj.actions.removeUser(user, user);
      } else {
        console.warn('no room found while disconnecting');
      }
    }
  };
  return user;
}

exports.getFromRef = function (ref) {
  return usersByRef[ref];
};
exports.getFromSocket = function (socket) {
  var id = socketsByIndex.indexOf(socket);
  if (id === -1) {
    var user = createUser(socket);
    id = socketsByIndex.length;
    socketsByIndex[id] = socket;
    usersByIndex[id] = usersByRef[user.getRef()] = user;
    return user;
  }
  return usersByIndex[id];
};
