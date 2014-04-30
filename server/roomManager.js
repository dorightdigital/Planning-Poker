var guid = require('guid');
var _ = require('underscore');
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
  var participants = [];

  function pushParticipantListToAllUsers() {
    var part = [];
    _.each(participants, function (partic) {
      part.push({
        name: partic.getName()
      })
    });
    host.pushParticipantList(ref, part);
    _.each(participants, function (participant) {
      participant.pushParticipantList(ref, part);
    });
  }

  return rooms[ref] = room = {
    info: {
      name: name,
      ref: ref,
      url: url.forRoom(ref)
    },
//      approved: [],
//      pending: [],
//      all: [],
//    },
    actions: {
      participantRequest: function (user) {
        host.participantRequest(user, room, user.getName());
      },
      participantAccept: function (user, acceptor) {
        if (acceptor === host) {
          user.accessGranted(ref);
          participants.push(user);
          pushParticipantListToAllUsers();
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
      },
      newVotingRound: function (name, user) {
        if (user !== host) {
          user.sendError('You can\'t start voting rounds unless you\'re the host.');
          return;
        }
        _.each(participants, function (participant) {
          participant.voteRequired(ref, guid.raw(), name);
        });
      },
      removeUser: function (user) {
        participants = _.without(participants, user);
        pushParticipantListToAllUsers();
      }
    }
  };
};
