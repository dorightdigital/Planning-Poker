define(['jquery', 'apiClient'], function ($, api) {
  return {
    init: function ($elem) {
      var id = $elem.data('ref');
      var name = $elem.data('name');
      $elem.append($('<h1/>').text('Welcome to room ' + name));
      $elem.append($('<form/>').append('<input class="name" placeholder="Your Name"/>').submit(function (e) {
        e.preventDefault();
        api.joinRoom(id, $(this).find('.name').val()).onApprove(function () {
          $elem.find('h1').text('You\'re in!');
        }).onReject(function () {
          $elem.find('h1').text('Nope, you\'re not allowed.');
        });
        $elem.html('<h1>Joining... waiting for permission</h1>')
      }))
    }
  }
});
