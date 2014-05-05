define(['apiClient'], function (api) {
  return {
    init: function ($elem) {
      api.onJoinRequest(function (config) {
        var $acceptButton = $('<button class="accept">Accept</button>');
        var $rejectButton = $('<button class="reject">Reject</button>');
        var $request = $('<li/>').text(config.name).append($acceptButton).append($rejectButton);
        $acceptButton.one('click', function (e) {
          e.preventDefault();
          api.acceptParticipant(config.ref);
          $request.fadeOut();
        });
        $rejectButton.one('click', function (e) {
          e.preventDefault();
          api.rejectParticipant(config.ref);
          $request.fadeOut();
        });
        $elem.append($request);
      })
    }
  }
});
