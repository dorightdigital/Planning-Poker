var roomUrlPrefix = '/room/';
exports.init = function (app, config) {
  var rooms = require('./roomManager');

  app.param('room', function (req, res, next, roomId) {
    var room = rooms.get(roomId);
    if (room) {
      req.room = room;
    } else {
      next(new Error('failed to load room ' + roomId));
    }
    next();
  });
  app.get("/", function (req, res) {
    res.render("page", {config: config});
  });
  app.get(roomUrlPrefix + ":room", function (req, res) {
    res.render('room', {room: req.room.info, config: config});
  });
};
exports.forRoom = function (ref) {
  return roomUrlPrefix + ref;
};
