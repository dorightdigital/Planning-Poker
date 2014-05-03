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
  var participants = [];
  var potentialParticipants = [];
  var votingRound;
  var votingStatus = {
    pending: [],
    voted: []
  }

  function pushParticipantListToAllUsers() {
    var part = [];
    _.each(participants, function (participant) {
      part.push({
        name: participant.getName()
      })
    });
    host.pushParticipantList(ref, part);
    _.each(participants, function (participant) {
      participant.pushParticipantList(ref, part);
    });
  }

  function sendVotingStatusUpdate() {
    var voteRef = votingRound[1];
    host.fullVotingStatus(voteRef, votingStatus.pending, votingStatus.voted);
    _.each(participants, function (participant) {
      participant.votingProgress(voteRef, votingStatus.voted.length / (votingStatus.voted.length + votingStatus.pending.length));
    });
    host.votingProgress(voteRef, votingStatus.voted.length / (votingStatus.voted.length + votingStatus.pending.length));
  }

  var room = rooms[ref] = {
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
        potentialParticipants.push(user);
        host.participantRequest(user, room, user.getName());
      },
      participantAccept: function (user, acceptor) {
        if (acceptor === host) {
          user.accessGranted(ref);
          participants.push(user);
          pushParticipantListToAllUsers();
          if (votingRound) {
            user.voteRequired.apply(null, votingRound);
            votingStatus.pending.push(user.getName());
            sendVotingStatusUpdate();
          }
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
        votingRound = [ref, guid.raw(), name];
        _.each(participants, function (participant) {
          participant.voteRequired.apply(null, votingRound);
          votingStatus.pending.push(participant.getName());
        });
        sendVotingStatusUpdate();
      },
      voteReceived: function (user) {
        var userName = user.getName();
        votingStatus.voted.push(userName);
        votingStatus.pending = _.without(votingStatus.pending, userName);
        sendVotingStatusUpdate();
      },
      removeUser: function (user) {
        if (user === host) {
          _.each(potentialParticipants, function (part) {
            part.roomClosed(room);
          });
          delete rooms[room.info.ref];
        } else {
          participants = _.without(participants, user);
          pushParticipantListToAllUsers();
        }
      }
    }
  };

  host.roomReady(room);

  return room;
};
