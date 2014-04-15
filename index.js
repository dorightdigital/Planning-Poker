var express = require("express");
var app = express();
var port = 3700;
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
app.param(function (name, fn) {
  if (fn instanceof RegExp) {
    return function (req, res, next, val) {
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function (req, res) {
  res.render("page");
});
app.param('id', /^([\da-f]+\-){4}[\da-f]+$/);
app.get("/room/:id", function (req, res) {
  var id = req.params.id[0];
  var room = rooms[id];
  if (room) {
    console.log(room.info);
    res.render("room", room.info);
  } else {
    res.status(404).render("notFound", {ref: "Room " + id})
  }
});
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

var rooms = {};

io.sockets.on('connection', function (socket) {
  socket.on('join-room', function (config) {
    var room = rooms[config.id];
    var ref = guid();
    if (room) {
      room.participants.pending[ref] = {
        name: config.name,
        socket: socket
      };
      room.participants.host.socket.emit('participant-request', {
        name: config.name,
        ref: ref
      });
    } else {
      socket.emit('error', 'Room not found');
    }
  });
  socket.on('open-room', function (config) {
    var ref = guid();
    var room = {
      info: {
        name: config.name,
        ref: ref,
        url: '/room/' + ref
      },
      participants: {
        approved: [],
        pending: [],
        host: {
          socket: socket
        }
      }};
    rooms[ref] = room;
    socket.set('role', 'host', function () {
      socket.emit('room-ready', room.info);
    });
  });
  socket.on('participant-accept', function (config) {
    var room = rooms[config.roomId];
    if (!room) {
      console.warn('no room with id ' + config.roomId);
      return;
    }
    var ref = config.ref;
    var participants = room.participants;
    if (socket === participants.host.socket) {
      var userObj = participants.pending[ref];
      if (userObj) {
        participants.approved[ref] = userObj;
        delete participants.pending[ref];
        userObj.socket.emit('participant-approve');
      } else {
        console.warn('couldn\'t find person with ref ' + ref);
      }
    } else {
      console.warn('non host wants to accept participant');
    }
  })
  socket.on('participant-reject', function (config) {
    var room = rooms[config.roomId];
    if (!room) {
      console.warn('no room with id ' + config.roomId);
      return;
    }
    var ref = config.ref;
    var participants = room.participants;
    if (socket === participants.host.socket) {
      var userObj = participants.pending[ref];
      if (userObj) {
        delete participants.pending[ref];
        userObj.socket.emit('participant-reject');
      } else {
        console.warn('couldn\'t find person with ref ' + ref);
      }
    } else {
      console.warn('non host wants to accept participant');
    }
  })
});

