describe('User Manager', function () {
  var um = require('../../server/userManager');
  var rm = require('../../server/roomManager');
  var hostSocket;
  var host;
  var guestSocket;
  var guest;
  var room;
  beforeEach(function () {
    hostSocket = {emit: jasmine.createSpy('socket.emit')};
    host = um.getFromSocket(hostSocket);
    guestSocket = {emit: jasmine.createSpy('socket.emit')};
    guest = um.getFromSocket(guestSocket);
    room = rm.create(host, 'name');
  });
  it('should create one (singleton) instance for one socket', function () {
    var userB = um.getFromSocket(hostSocket);
    expect(host).toBe(userB);
  });
  it('should create multiple instances for multiple users', function () {
    expect(host).not.toBe(guest);
  });
  it('should include a unique reference per user', function () {
    expect(host.getRef()).not.toBe(guest.getRef());
  });
  it('should use guid library to create ref', function () {
    spyOn(require('guid'), 'raw').andReturn('myGuid');
    expect(require('./helpers').generateUser().getRef()).toBe('myGuid');
  });
  it('should inform user when room is ready', function () {
    host.roomReady(room);
    expect(hostSocket.emit).toHaveBeenCalledWith('room-ready', room.info);
  });
  it('should host user of participantRequest', function () {
    var participantList = [];
    host.participantRequest(participantList, room);
    expect(hostSocket.emit).toHaveBeenCalledWith('participant-request', {
      roomRef: room.info.ref,
      pendingParticipants: participantList
    });
  });
  it('should inform user of participantRequest', function () {
    var participantList = [];
    host.participantRequest(participantList, room, 'Another');
    expect(hostSocket.emit).toHaveBeenCalledWith('participant-request', {
      roomRef: room.info.ref,
      pendingParticipants: jasmine.any(Array)
    });
  });
  it('should inform user of error during participantRequest', function () {
    host.sendError('error message');
    expect(hostSocket.emit).toHaveBeenCalledWith('server-error', 'error message');
  });
  it('should inform user of granted access', function () {
    guest.accessGranted('some-room');
    expect(guestSocket.emit).toHaveBeenCalledWith('participant-approve', {
      roomRef: 'some-room'
    });
  });
  it('should inform user of rejected access', function () {
    guest.accessRefused('some-room');
    expect(guestSocket.emit).toHaveBeenCalledWith('participant-reject', {
      roomRef: 'some-room'
    });
  });
  it('should inform user when vote is required', function () {
    guest.voteRequired('some-room', 'some-task', 'task-name');
    expect(guestSocket.emit).toHaveBeenCalledWith('vote-required', {
      roomRef: 'some-room',
      taskRef: 'some-task',
      taskName: 'task-name'
    });
  });
  it('should leave room participated in on disconnect', function () {
    guest.setCurrentRoomRef(room.info.ref);
    spyOn(room.actions, 'removeUser');
    guest.disconnect();
    expect(room.actions.removeUser).toHaveBeenCalledWith(guest, guest);
  });
  it('should leave room participated in on joining another room', function () {
    guest.setCurrentRoomRef(room.info.ref);
    spyOn(room.actions, 'removeUser');
    guest.setCurrentRoomRef('a');
    expect(room.actions.removeUser).toHaveBeenCalledWith(guest, guest);
  });
  it('should leave hosted room on disconnect', function () {
    spyOn(room.actions, 'removeUser');
    host.disconnect();
    expect(room.actions.removeUser).toHaveBeenCalledWith(host, host);
  });
  it('should inform user of room closure', function () {
    guest.roomClosed('ref');
    expect(guestSocket.emit).toHaveBeenCalledWith('room-closed', {roomRef: 'ref'});
  });
  it('should inform user (host) of full voting status', function () {
    var voted = [];
    var pending = [];
    host.fullVotingStatus('vote-ref', pending, voted);
    expect(hostSocket.emit).toHaveBeenCalledWith('full-voting-status', jasmine.any(Object));
    var obj = hostSocket.emit.mostRecentCall.args[1];
    expect(obj.voted).toBe(voted);
    expect(obj.pending).toBe(pending);
    expect(obj.voteRef).toBe('vote-ref');
  });
  it('should inform user (guest) of voting progress', function () {
    guest.votingProgress('vote-ref', 3 / 5);
    expect(guestSocket.emit).toHaveBeenCalledWith('voting-progress', jasmine.any(Object));
    var obj = guestSocket.emit.mostRecentCall.args[1];
    expect(obj.progressPercentage).toBe(3 / 5 * 100);
    expect(obj.voteRef).toBe('vote-ref');
  });
  it('should inform user (guest) of results', function () {
    var objOrValue = {};
    guest.result('vote-ref', 'keyword', objOrValue);
    expect(guestSocket.emit).toHaveBeenCalledWith('vote-result', jasmine.any(Object));
    var obj = guestSocket.emit.mostRecentCall.args[1];
    expect(obj.voteRef).toBe('vote-ref');
    expect(obj.resultType).toBe('keyword');
    expect(obj.resultDetail).toBe(objOrValue);
  });
  it('should pass on room info to user', function () {
    var obj = {};
    guest.roomDetails(obj);
    expect(guestSocket.emit).toHaveBeenCalledWith('room-details', obj);
  });
});
