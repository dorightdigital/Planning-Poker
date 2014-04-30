define(['jquery', 'apiClient'], function ($, api) {
  var nums = [1,2,3,5,8,13,21];
  return {
    init: function ($elem) {
      var id = $elem.data('ref');
      var name = $elem.data('name');
      $elem.append($('<h1/>').text('Welcome to room ' + name));
      $elem.append($('<form/>').append('<input class="name" placeholder="Your Name"/>').submit(function (e) {
        e.preventDefault();
        api.joinRoom(id, $(this).find('.name').val()).onApprove(function () {
          $elem.find('h1').text('You\'re in!');
          api.onVotingRequest(function (name, ref, roomRef) {
            if (roomRef !== id) {
              console.log('ignoring voting request for room', roomRef);
              return;
            }
            $elem.find('h1').text('Request to vote on task: ' + name);
            var $div = $('<div/>');
            $.each(nums, function (key, num) {
              $div.append($('<button/>').text(num).click(function () {
                api.vote(num, ref, roomRef);
              }));
            });
            $elem.append($div);
          });
        }).onReject(function () {
          $elem.find('h1').text('Nope, you\'re not allowed.');
        });
        $elem.html('<h1>Joining... waiting for permission</h1>')
      }))
    }
  }
});
