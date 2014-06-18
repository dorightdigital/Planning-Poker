var guid = require('guid');
var _ = require('underscore');
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
  var votingStatus;
  function pushParticipantListToAllUsers() {
    var part = [];
    _.each(participants, function (participant) {
      part.push({
        name: participant.getName()
      });
    });
    host.pushParticipantList(ref, part);
    _.each(participants, function (participant) {
      participant.pushParticipantList(ref, part);
    });
  }

  function sendVotingStatusUpdate() {
    var voteRef = votingStatus.ref;
    if (votingStatus.pending.length === 0) {
      var numOfDifferentAnswers = 0;
      var lastAnswer = 0;
      var params = 0;
      _.each(votingStatus.answers, function (people, key) {
        numOfDifferentAnswers++;
        lastAnswer = key;
      });
      if (numOfDifferentAnswers > 1) {
        params = [voteRef, 'varied', votingStatus.answers];
      } else {
        params = [voteRef, 'agreed', parseInt(lastAnswer, 10)];
      }
      host.result.apply(host, params);
      _.each(participants, function (user) {
        user.result.apply(user, params);
      });
    } else {
      host.fullVotingStatus(voteRef, votingStatus.pending, votingStatus.voted);
      _.each(participants, function (participant) {
        participant.votingProgress(voteRef, votingStatus.voted.length / (votingStatus.voted.length + votingStatus.pending.length));
      });
      host.votingProgress(voteRef, votingStatus.voted.length / (votingStatus.voted.length + votingStatus.pending.length));
    }
  }
  function requireVoteFromParticipant(user) {
    user.voteRequired(ref, votingStatus.ref, votingStatus.name);
  }

  function pushPendingParticipantsToHost() {
    var list = _.map(potentialParticipants, function (user) {
      return {name: user.getName(), ref: user.getRef()};
    });
    host.participantRequest(list, room);
  }

  var room = rooms[ref] = {
    info: {
      name: name,
      ref: ref
    },
    actions: {
      participantRequest: function (user) {
        potentialParticipants.push(user);
        pushPendingParticipantsToHost();
      },
      participantAccept: function (user, acceptor) {
        if (acceptor === host) {
          user.accessGranted(ref);
          participants.push(user);
          pushParticipantListToAllUsers();
          potentialParticipants = _.without(potentialParticipants, user);
          pushPendingParticipantsToHost();
          if (votingStatus) {
            requireVoteFromParticipant(user);
            votingStatus.pending.push(user.getName());
            sendVotingStatusUpdate();
          }
        } else {
          acceptor.sendError('You can\'t approve users unless you\'re the host.');
        }
      },
      participantReject: function (user, acceptor) {
        if (acceptor === host) {
          user.accessRefused(ref);
          potentialParticipants = _.without(potentialParticipants, user);
          pushPendingParticipantsToHost();
        } else {
          acceptor.sendError('You can\'t reject users unless you\'re the host.');
        }
      },
      newVotingRound: function (name, user) {
        if (user !== host) {
          user.sendError('You can\'t start voting rounds unless you\'re the host.');
          return;
        }
        votingStatus = {
          pending: [],
          voted: [],
          answers: {},
          ref: guid.raw(),
          name: name
        };
        _.each(participants, function (participant) {
          requireVoteFromParticipant(participant);
          votingStatus.pending.push(participant.getName());
        });
        sendVotingStatusUpdate();
      },
      voteReceived: function (user, vote) {
        var userName = user.getName();
        var voteAsString = ('' + vote);
        votingStatus.answers[voteAsString] = votingStatus.answers[voteAsString] || [];
        votingStatus.answers[voteAsString].push(userName);
        votingStatus.voted.push(userName);
        votingStatus.pending = _.without(votingStatus.pending, userName);
        sendVotingStatusUpdate();
      },
      removeUser: function (user) {
        if (user === host) {
          _.each(potentialParticipants, function (part) {
            part.roomClosed(room);
          });
          _.each(participants, function (part) {
            part.roomClosed(room);
          });
          delete rooms[room.info.ref];
        } else {
          participants = _.without(participants, user);
          pushParticipantListToAllUsers();
          if (votingStatus) {
            votingStatus.pending = _.without(votingStatus.pending, user.getName());
            sendVotingStatusUpdate();
          }
        }
      }
    }
  };

  host.roomReady(room);

  return room;
};
