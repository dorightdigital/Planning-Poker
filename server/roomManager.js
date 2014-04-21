var guid = require('guid');
var url = require('./urls');
var rooms = {};

exports.get = function (id) {
  return rooms[id];
};
exports.exists = function (id) {
  return rooms.hasOwnProperty(id);
};
exports.create = function (host, name) {
  var ref = guid.raw();
  var room;
  return rooms[ref] = room = {
    info: {
      name: name,
      ref: ref,
      url: url.forRoom(ref)
    },
//    participants: {
//      approved: [],
//      pending: [],
//      all: [],
//    },
    actions: {
      participantRequest: function (user, name) {
        host.participantRequest(user, room, name);
      },
      participantAccept: function (user, acceptor) {
        if (acceptor === host) {
          user.accessGranted(ref);
        } else {
          acceptor.sendError('You can\'t approve users unless you\'re the host.')
        }
      },
      participantReject: function (user, acceptor) {
        if (acceptor === host) {
          user.accessRefused(ref);
        } else {
          acceptor.sendError('You can\'t reject users unless you\'re the host.')
        }
      }
    }
  };
};
