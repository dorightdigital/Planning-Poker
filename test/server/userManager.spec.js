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
  it('should inform user of participantRequest', function () {
    host.participantRequest(guest, room, 'guest');
    expect(hostSocket.emit).toHaveBeenCalledWith('participant-request', {
      name: 'guest',
      ref: guest.getRef()
    });
  });
  it('should inform user of participantRequest', function () {
    host.participantRequest(guest, room, 'Another');
    expect(hostSocket.emit).toHaveBeenCalledWith('participant-request', {
      name: 'Another',
      ref: guest.getRef()
    });
  });
  it('should inform user of participantRequest', function () {
    host.sendError('error message');
    expect(hostSocket.emit).toHaveBeenCalledWith('error', 'error message');
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
  it('should leave rooms participated in on disconnect', function () {
    guest.accessGranted(room.info.ref);
    spyOn(room.actions, 'removeUser');
    guest.disconnect();
    expect(room.actions.removeUser).toHaveBeenCalledWith(guest);
  });
  it('should leave hosted rooms on disconnect', function () {
    spyOn(room.actions, 'removeUser');
    host.disconnect();
    expect(room.actions.removeUser).toHaveBeenCalledWith(host);
  });
  it('should inform user of room closure', function () {
    guest.roomClosed('ref');
    expect(guestSocket.emit).toHaveBeenCalledWith('room-closed', {roomRef: 'ref'});
  });
});
