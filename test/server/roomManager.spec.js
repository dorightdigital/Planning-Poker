describe('Room Manager', function () {
  var roomManager = require('../../server/roomManager');
  var um = require('../../server/userManager');
  var api = require('../../server/serverApi');
  var help = require('./helpers');
  var guid = require('guid');
  var _ = require('underscore');
  var assume = expect;
  describe('newly created rooms', function () {
    beforeEach(function () {
      this.host = help.generateUser();
      spyOn(this.host, 'roomReady');
      this.room = roomManager.create(this.host, this.name = 'Abc');
    });
    it('should store name', function () {
      expect(this.room.info.name).toBe(this.name);
    });
    it('should assign unique reference', function () {
      expect(this.room.info.ref).not.toEqual(roomManager.create(help.generateUser(), 'Def').info.ref);
    });
    it('should be gettable', function () {
      expect(roomManager.get(this.room.info.ref)).toBe(this.room);
    });
    it('should inform host of creation', function () {
      expect(this.host.roomReady).toHaveBeenCalledWith(this.room);
    });
  });
  it('should use guid for reference', function () {
    var fakeGuid = 'my-guid';
    spyOn(require('guid'), 'raw').andReturn(fakeGuid);
    expect(roomManager.create(help.generateUser(), 'Def').info.ref).toEqual(fakeGuid);
  });
  it('should show existence status', function () {
    var fakeGuid = 'my-guid2';
    spyOn(require('guid'), 'raw').andReturn(fakeGuid);
    assume(roomManager.exists(fakeGuid)).toBeFalsy();
    roomManager.create(help.generateUser(), 'Ghi');
    expect(roomManager.exists(fakeGuid)).toBeTruthy();
  });
  describe('Actions', function () {
    var host, guest, room;

    function requestAndAcceptGuest(guest, name) {
      guest.setName(name);
      room.actions.participantRequest(guest, 'abc');
      room.actions.participantAccept(guest, host);
    }

    beforeEach(function () {
      host = help.generateUser();
      guest = help.generateUser();
      host.setName('Mr. Host');
      guest.setName('Miss. Guest');
      room = roomManager.create(host, 'abc');
    });
    describe('Joining a room', function () {
      function potentialParticipantList() {
        return host.participantRequest.mostRecentCall.args[0];
      }

      it('should inform host when user requests to join room', function () {
        spyOn(host, 'participantRequest');
        guest.setName('abc');
        room.actions.participantRequest(guest);
        expect(host.participantRequest).toHaveBeenCalledWith(jasmine.any(Array), room);
        expect(potentialParticipantList()).toEqual([{name: 'abc',ref: guest.getRef()}]);
      });
      it('should update participant requests on acceptance', function () {
        spyOn(host, 'participantRequest');
        guest.setName('abc');
        room.actions.participantRequest(guest);
        host.participantRequest.reset();
        room.actions.participantAccept(guest, host);
        expect(host.participantRequest).toHaveBeenCalledWith(jasmine.any(Array), room);
        expect(potentialParticipantList()).toEqual([]);
      });
      it('should update participant requests on rejection', function () {
        spyOn(host, 'participantRequest');
        guest.setName('abc');
        room.actions.participantRequest(guest);
        host.participantRequest.reset();
        room.actions.participantReject(guest, host);
        expect(host.participantRequest).toHaveBeenCalledWith(jasmine.any(Array), room);
        expect(potentialParticipantList()).toEqual([]);
      });
      it('should inform user when they are accepted by host', function () {
        spyOn(guest, 'accessGranted');
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantAccept(guest, host);
        expect(guest.accessGranted).toHaveBeenCalledWith(room.info.ref);
      });
      it('should ignore approval when not from host', function () {
        var randomUser = help.generateUser();
        spyOn(guest, 'accessGranted');
        spyOn(randomUser, 'sendError');
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantAccept(guest, randomUser);
        expect(guest.accessGranted).not.toHaveBeenCalled();
        expect(randomUser.sendError).toHaveBeenCalledWith('You can\'t approve users unless you\'re the host.');
      });
      it('should inform user when they are rejected by host', function () {
        spyOn(guest, 'accessRefused');
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantReject(guest, host);
        expect(guest.accessRefused).toHaveBeenCalledWith(room.info.ref);
      });
      it('should inform all users in room when participant joins', function () {
        var guest2 = help.generateUser();
        guest2.setName('Abc');
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantRequest(guest2, 'abc');
        room.actions.participantAccept(guest, host);
        var users = [host, guest, guest2];
        _.each(users, function (user) {
          spyOn(user, 'pushParticipantList');
        });
        room.actions.participantAccept(guest2, host);
        _.each(users, function (user) {
          var data = user.pushParticipantList.calls[0].args[1];
          expect(user.pushParticipantList).toHaveBeenCalledWith(room.info.ref, jasmine.any(Object));
          expect(data).toEqual([
            {name: 'Miss. Guest'},
            {name: 'Abc'}
          ]);
        });
      });
      it('should send updated participant list when guest leaves room', function () {
        room.actions.participantRequest(guest);
        room.actions.participantAccept(guest, host);
        spyOn(host, 'pushParticipantList');
        room.actions.removeUser(guest);
        expect(host.pushParticipantList).toHaveBeenCalled();
        expect(host.pushParticipantList.mostRecentCall.args[1]).toEqual({});
      });
      it('should close room when host leaves', function () {
        var pendingGuest = help.generateUser();
        room.actions.participantRequest(pendingGuest);
        room.actions.participantRequest(guest);
        room.actions.participantAccept(guest, host);
        spyOn(guest, 'pushParticipantList');
        spyOn(guest, 'roomClosed');
        spyOn(pendingGuest, 'roomClosed');
        room.actions.removeUser(host);
        expect(guest.pushParticipantList).not.toHaveBeenCalled();
        expect(guest.roomClosed).toHaveBeenCalled();
        expect(pendingGuest.roomClosed).toHaveBeenCalled();
      });
      it('should properly remove room when host leaves', function () {
        room.actions.removeUser(host);
        expect(roomManager.exists(room.info.ref)).toBeFalsy();
      });
      it('should ignore rejection when not from host', function () {
        var randomUser = help.generateUser();
        spyOn(guest, 'accessRefused');
        spyOn(randomUser, 'sendError');
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantReject(guest, randomUser);
        expect(guest.accessRefused).not.toHaveBeenCalled();
        expect(randomUser.sendError).toHaveBeenCalledWith('You can\'t reject users unless you\'re the host.');
      });
    });
    describe('voting', function () {
      var guest2;

      beforeEach(function () {
        guest2 = help.generateUser();
        requestAndAcceptGuest(guest, 'abc');
        requestAndAcceptGuest(guest2, 'def');
        spyOn(guid, 'raw').andReturn('known-guid');
      });
      it('should inform guests when host stats voting round', function () {
        spyOn(guest, 'voteRequired');
        spyOn(guest2, 'voteRequired');
        room.actions.newVotingRound('abc', host);
        expect(guest.voteRequired).toHaveBeenCalledWith(room.info.ref, 'known-guid', 'abc');
        expect(guest2.voteRequired).toHaveBeenCalledWith(room.info.ref, 'known-guid', 'abc');
      });
      it('should inform late-entry guests mid-voting round', function () {
        var guest = help.generateUser();
        spyOn(guest, 'voteRequired');
        room.actions.newVotingRound('abc', host);
        requestAndAcceptGuest(guest, 'ghi');
        expect(guest.voteRequired).toHaveBeenCalledWith(room.info.ref, 'known-guid', 'abc');
      });
      it('should reject non-host stating voting round', function () {
        spyOn(guest2, 'voteRequired');
        spyOn(guest, 'sendError');
        room.actions.newVotingRound('abc', guest);
        expect(guest2.voteRequired).not.toHaveBeenCalled();
        expect(guest.sendError).toHaveBeenCalledWith('You can\'t start voting rounds unless you\'re the host.');
      });
      describe('receiving votes', function () {
        var pendingNames, votedNames, voteRef;
        beforeEach(function () {
          pendingNames = undefined;
          votedNames = undefined;
          voteRef = undefined;
          spyOn(guest, 'votingProgress');
          spyOn(guest2, 'votingProgress');
          spyOn(host, 'votingProgress');
          spyOn(host, 'fullVotingStatus').andCallFake(function (ref, waiting, voted) {
            pendingNames = waiting;
            votedNames = voted;
            voteRef = ref;
          });
          guid.raw.andReturn('new-guid');
          room.actions.newVotingRound('abc', host);
        });
        it('should send the correct vote reference', function () {
          expect(voteRef).toBe('new-guid');
        });
        it('should publish initial voting status to host', function () {
          expect(host.fullVotingStatus).toHaveBeenCalled();
          expect(pendingNames[0]).toBe('abc');
          expect(pendingNames[1]).toBe('def');
        });
        it('should publish initial voting status to guests and host', function () {
          expect(guest.votingProgress).toHaveBeenCalledWith('new-guid', 0);
          expect(guest2.votingProgress).toHaveBeenCalledWith('new-guid', 0);
          expect(host.votingProgress).toHaveBeenCalledWith('new-guid', 0);
        });
        it('should update voting status when guest votes', function () {
          host.fullVotingStatus.reset();
          room.actions.voteReceived(guest, 'known-guid', 13);
          expect(host.fullVotingStatus).toHaveBeenCalled();
          expect(votedNames).toContain('abc');
          expect(pendingNames).toContain('def');
        });
        it('should update voting status when new guest joins mid-vote', function () {
          host.fullVotingStatus.reset();
          requestAndAcceptGuest(help.generateUser(), 'ghi');
          expect(host.fullVotingStatus).toHaveBeenCalled();
          expect(pendingNames).toContain('ghi');
        });
        it('should update voting status when new guest leaves before voting', function () {
          host.fullVotingStatus.reset();
          room.actions.removeUser(guest);
          expect(host.fullVotingStatus).toHaveBeenCalled();
          expect(pendingNames).not.toContain('abc');
        });
        it('should update voting status anonymously for guests and host', function () {
          room.actions.voteReceived(guest, 'known-guid', 13);
          expect(guest.votingProgress).toHaveBeenCalledWith('new-guid', 0.5);
          expect(guest2.votingProgress).toHaveBeenCalledWith('new-guid', 0.5);
          expect(host.votingProgress).toHaveBeenCalledWith('new-guid', 0.5);
        });
        it('should update voting status when new guest joins', function () {
          room.actions.voteReceived(guest, 'known-guid', 13);
          var guest3 = help.generateUser();
          spyOn(guest3, 'votingProgress');
          requestAndAcceptGuest(guest3, 'ghi');
          expect(guest.votingProgress).toHaveBeenCalledWith('new-guid', 1 / 3);
          expect(guest2.votingProgress).toHaveBeenCalledWith('new-guid', 1 / 3);
          expect(guest3.votingProgress).toHaveBeenCalledWith('new-guid', 1 / 3);
          expect(host.votingProgress).toHaveBeenCalledWith('new-guid', 1 / 3);
        });
      });
    });
    describe('finishing and restarting', function () {
      var guest;
      var guest2;
      var guest3;
      var allUsers;
      var allGuests;

      function userVotes(user, vote) {
        room.actions.voteReceived(user, vote, 'known-guid');
      }

      beforeEach(function () {
        guest = help.generateUser();
        guest2 = help.generateUser();
        guest3 = help.generateUser();
        requestAndAcceptGuest(guest, 'a');
        requestAndAcceptGuest(guest2, 'b');
        requestAndAcceptGuest(guest3, 'c');
        allUsers = [host, guest, guest2, guest3];
        allGuests = _.without(allUsers, host);
        spyOn(guid, 'raw').andReturn('vote-ref');
        room.actions.newVotingRound('abc', host);
        _.each(allUsers, function (user) {
          spyOn(user, 'result');
        });
      });
      describe('sharing results', function () {

        it('should show send status when everyone agrees', function () {
          _.each(allGuests, function (user) {
            userVotes(user, 3);
          });
          _.each(allUsers, function (user) {
            expect(user.result).toHaveBeenCalledWith('vote-ref', 'agreed', 3);
          });
        });
        it('should show send correct answer when everyone agrees', function () {
          _.each(allGuests, function (user) {
            userVotes(user, 5);
          });
          _.each(allUsers, function (user) {
            expect(user.result).toHaveBeenCalledWith('vote-ref', 'agreed', 5);
          });
        });
        it('should not publish result until all users have voted', function () {
          userVotes(guest, 3);
          _.each(allUsers, function (user) {
            expect(user.result).not.toHaveBeenCalled();
          });
        });
        it('should publish individual result when no consensus', function () {
          userVotes(guest, 8);
          userVotes(guest2, 3);
          userVotes(guest3, 3);
          _.each(allGuests, function (user) {
            expect(user.result).toHaveBeenCalledWith('vote-ref', 'varied', jasmine.any(Object));
            var resultObj = user.result.mostRecentCall.args[2];
            expect(resultObj).toEqual({
              "3": ['b', 'c'],
              "8": ['a']
            });
          });
        });
      });
      describe('restarting', function () {
        beforeEach(function () {
          guid.raw.andReturn('new-vote-ref');
        });
        it('should reset progress to zero on new voting round ', function () {
          userVotes(guest, 8);
          _.each(allUsers, function (user) {
            spyOn(user, 'votingProgress');
          });
          room.actions.newVotingRound('abc', host);
          _.each(allUsers, function (user) {
            expect(user.votingProgress).toHaveBeenCalledWith('new-vote-ref', 0);
          });
        });
      });
    });
  });
});
