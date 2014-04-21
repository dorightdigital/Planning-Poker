describe('Room Manager', function () {
  var roomManager = require('../../server/roomManager');
  var um = require('../../server/userManager');
  var api = require('../../server/serverApi');
  var help = require('./helpers');
  var assume = expect;
  describe('newly created rooms', function () {
    beforeEach(function () {
      this.room = roomManager.create(this.hostUserObj = {}, this.name = 'Abc');
    });
    it('should store name', function () {
      expect(this.room.info.name).toBe(this.name);
    });
    it('should assign unique reference', function () {
      expect(this.room.info.ref).not.toEqual(roomManager.create({}, 'Def').info.ref);
    });
    it('should be gettable', function () {
      expect(roomManager.get(this.room.info.ref)).toBe(this.room);
    });
  });
  it('should use guid for reference', function () {
    var fakeGuid = 'my-guid';
    spyOn(require('guid'), 'raw').andReturn(fakeGuid);
    expect(roomManager.create({}, 'Def').info.ref).toEqual(fakeGuid);
  });
  it('should lookup room URL', function () {
    spyOn(require('../../server/urls'), 'forRoom').andReturn('something');
    var id = roomManager.create({}, 'Def').info.ref;
    expect(require('../../server/urls').forRoom).toHaveBeenCalledWith(id);
    expect(roomManager.create({}, 'Def').info.url).toBe('something');
  });
  it('should show existence status', function () {
    var fakeGuid = 'my-guid2';
    spyOn(require('guid'), 'raw').andReturn(fakeGuid);
    assume(roomManager.exists(fakeGuid)).toBeFalsy();
    roomManager.create({}, 'Ghi');
    expect(roomManager.exists(fakeGuid)).toBeTruthy();
  });
  describe('Actions', function () {
    var host, guest, room;
    beforeEach(function () {
      host = help.generateUser();
      guest = help.generateUser();
      room = roomManager.create(host, 'abc');
    });
    it('should inform host when user requests to join room', function () {
      spyOn(host, 'participantRequest');
      room.actions.participantRequest(guest, 'abc');
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
});
