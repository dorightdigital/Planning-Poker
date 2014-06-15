define(['jquery', 'apiClient', 'shared/voteProgress', 'shared/resultRenderer'], function ($, api, vp, rr) {
  var nums = [1,2,3,5,8,13,21];
  return {
    init: function ($elem) {
      var id = $elem.data('ref');
      var name = $elem.data('name');
      $elem.append($('<h1/>').text('Welcome to room ' + name));
      $elem.append($('<form/>').append('<input class="name" placeholder="Your Name"/>').submit(function (e) {
        e.preventDefault();
        api.joinRoom(id, $(this).find('.name').val()).onApprove(function () {
          var $div = $('<div/>').appendTo($elem);
          rr($div);
          $elem.find('h1').text('You\'re in!');
        }).onReject(function () {
          $elem.find('h1').text('Nope, you\'re not allowed.');
        });
        $elem.html('<h1>Joining... waiting for permission</h1>');
      }));
      api.onRoomClose(function () {
        $elem.html('<h1>This room has been closed.</h1>');
      });
    }
  };
});
