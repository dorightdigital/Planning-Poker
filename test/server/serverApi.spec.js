describe('Server API', function () {
  var api = require('../../server/serverApi');
  var io = require('socket.io');
  var um = require('../../server/userManager');
  var help = require('./helpers');
  var server;
  var connection;
  beforeEach(function () {
    server = {};
    spyOn(io, 'listen').andReturn({
      sockets: {
        on: function (name, fn) {
          connection = fn;
        }
      }
    });
  });
  it('should listen on same config as server', function () {
    api.init(server);
    expect(io.listen).toHaveBeenCalledWith(server);
  });
  it('should listen for socket connections', function () {
    spyOn(io.listen().sockets, 'on');
    api.init(server);
    expect(io.listen().sockets.on).toHaveBeenCalledWith('connection', jasmine.any(Function));
  });
  it('should create user object on connection', function () {
    api.init(server);
    spyOn(um, 'getFromSocket');
    var socket = {on: function () {
    }};
    connection(socket);
    expect(um.getFromSocket).toHaveBeenCalledWith(socket);
  });
  describe('event responses', function () {
    var rm = require('../../server/roomManager');
    var events;
    var socket;
    var user;
    var room;
    beforeEach(function () {
      events = {};
      socket = {
        on: function (name, fn) {
          events[name] = fn;
        },
        emit: jasmine.createSpy('socket.emit')
      };
      connection(socket);
      user = um.getFromSocket(socket);
      room = rm.create(user, 'abc');
    });
    function fireEvent(name, obj) {
      events[name](obj);
    }

    it('should create room upon request', function () {
      var room = {info: {}};
      spyOn(rm, 'create').andReturn(room);
      fireEvent('open-room', {name: 'abc'});
      expect(rm.create).toHaveBeenCalledWith(um.getFromSocket(socket), 'abc');
    });
    it('should have join room feature', function () {
      spyOn(room.actions, 'participantRequest');
      fireEvent('join-room', {ref: room.info.ref, name: 'abc'});
      expect(room.actions.participantRequest).toHaveBeenCalledWith(user);
    });
    it('should set user\'s name', function () {
      fireEvent('join-room', {ref: room.info.ref, name: 'def'});
      expect(user.getName()).toBe('def');
    });
    it('should set user\'s current room', function () {
      spyOn(user, 'setCurrentRoomRef');
      fireEvent('join-room', {ref: room.info.ref, name: 'def'});
      expect(user.setCurrentRoomRef).toHaveBeenCalledWith(room.info.ref);
    });
    it('should publish error if no room found while joining', function () {
      fireEvent('join-room', {ref: 'not-findable', name: 'abc'});
      expect(socket.emit).toHaveBeenCalledWith('server-error', 'Room not found "not-findable"');
    });
    describe('acceptance', function () {
      it('should inform room of acceptance', function () {
        var guest = help.generateUser();
        spyOn(room.actions, 'participantAccept');
        fireEvent('participant-accept', {roomRef: room.info.ref, userRef: guest.getRef()});
        expect(room.actions.participantAccept).toHaveBeenCalledWith(guest, user);
      });
      it('should publish error if no room found while accepting', function () {
        spyOn(user, 'sendError');
        fireEvent('participant-accept', {roomRef: 'not-findable', userRef: user.getRef()});
        expect(user.sendError).toHaveBeenCalledWith('Room not found "not-findable"');
      });
      it('should publish error if no user found while accepting', function () {
        spyOn(user, 'sendError');
        fireEvent('participant-accept', {roomRef: room.info.ref, userRef: 'not-findable'});
        expect(user.sendError).toHaveBeenCalledWith('User not found "not-findable"');
      });
    });
    describe('rejection', function () {
      it('should inform room of rejection', function () {
        var guest = help.generateUser();
        spyOn(room.actions, 'participantReject');
        fireEvent('participant-reject', {roomRef: room.info.ref, userRef: guest.getRef()});
        expect(room.actions.participantReject).toHaveBeenCalledWith(guest, user);
      });
      it('should publish error if no room found while rejecting', function () {
        spyOn(user, 'sendError');
        fireEvent('participant-reject', {roomRef: 'not-findable', userRef: user.getRef()});
        expect(user.sendError).toHaveBeenCalledWith('Room not found "not-findable"');
      });
      it('should publish error if no user found while rejecting', function () {
        spyOn(user, 'sendError');
        fireEvent('participant-reject', {roomRef: room.info.ref, userRef: 'not-findable'});
        expect(user.sendError).toHaveBeenCalledWith('User not found "not-findable"');
      });
    });
    it('should allow user to request voting', function () {
      spyOn(room.actions, 'newVotingRound');
      fireEvent('request-voting-round', {name: 'abc', roomRef: room.info.ref});
      expect(room.actions.newVotingRound).toHaveBeenCalledWith('abc', user);
    });
    it('should pass on error when no room found when initiating a voting round', function () {
      spyOn(user, 'sendError');
      fireEvent('request-voting-round', {name: 'abc', roomRef: 'a'});
      expect(user.sendError).toHaveBeenCalledWith('Room not found "a"');
    });
    it('should allow user to request voting', function () {
      spyOn(room.actions, 'voteReceived');
      fireEvent('vote', {value: 3, roomRef: room.info.ref, taskRef: 'abc'});
      expect(room.actions.voteReceived).toHaveBeenCalledWith(user, 3, 'abc');
    });
    it('should pass on message when user disconnects', function () {
      spyOn(user, 'disconnect');
      fireEvent('disconnect');
      expect(user.disconnect).toHaveBeenCalledWith();
    });
    it('should send back room details on ping', function () {
      spyOn(user, 'roomDetails');
      fireEvent('ping-room-details', {roomRef: room.info.ref});
      expect(user.roomDetails).toHaveBeenCalledWith(room.info);
    });
    it('should send details of any room', function () {
      var newRoom = rm.create(help.generateUser(), 'room name!');
      spyOn(user, 'roomDetails');
      fireEvent('ping-room-details', {roomRef: newRoom.info.ref});
      expect(user.roomDetails).toHaveBeenCalledWith(newRoom.info);
    });
  });
});
