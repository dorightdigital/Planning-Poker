exports.fakeSocket = function () {
  return {
    emit: function () {}
  };
};
exports.generateUser = function () {
  return require('../../server/userManager').getFromSocket(exports.fakeSocket());
};
