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
  it('should lookup room URL', function () {
    spyOn(require('../../server/urls'), 'forRoom').andReturn('something');
    var id = roomManager.create(help.generateUser(), 'Def').info.ref;
    expect(require('../../server/urls').forRoom).toHaveBeenCalledWith(id);
    expect(roomManager.create(help.generateUser(), 'Def').info.url).toBe('something');
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
    beforeEach(function () {
      host = help.generateUser();
      guest = help.generateUser();
      host.setName('Mr. Host');
      guest.setName('Miss. Guest');
      room = roomManager.create(host, 'abc');
    });
    it('should inform host when user requests to join room', function () {
      spyOn(host, 'participantRequest');
      guest.setName('abc');
      room.actions.participantRequest(guest);
      expect(host.participantRequest).toHaveBeenCalledWith(guest, room, 'abc');
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
      guest2.setName('Abc')
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
        expect(host.pushParticipantList.mostRecentCall.args[1]).toEqual([
          {
            name: 'Miss. Guest'
          },
          {
            name: 'Abc'
          }
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
    describe('voting', function () {
      var guest2;
      beforeEach(function () {
        guest2 = help.generateUser();
        room.actions.participantRequest(guest, 'abc');
        room.actions.participantRequest(guest2, 'abc');
        room.actions.participantAccept(guest, host);
        room.actions.participantAccept(guest2, host);
      });
      it('should inform guests when host stats voting round', function () {
        spyOn(guest, 'voteRequired');
        spyOn(guest2, 'voteRequired');
        spyOn(guid, 'raw').andReturn('known-guid');
        room.actions.newVotingRound('abc', host);
        expect(guest.voteRequired).toHaveBeenCalledWith(room.info.ref, 'known-guid', 'abc');
        expect(guest2.voteRequired).toHaveBeenCalledWith(room.info.ref, 'known-guid', 'abc');
      });
      it('should reject non-host stating voting round', function () {
        spyOn(guest2, 'voteRequired');
        spyOn(guest, 'sendError');
        room.actions.newVotingRound('abc', guest);
        expect(guest2.voteRequired).not.toHaveBeenCalled();
        expect(guest.sendError).toHaveBeenCalledWith('You can\'t start voting rounds unless you\'re the host.');
      });
    });
  });
});
