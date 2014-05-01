define(['apiClient'], function (api) {
  return {
    init: function ($elem) {
      var $list = $('<ul/>');
      api.onParticipantUpdate(function (participants) {
        $list.children().remove();
        $.each(participants, function () {
          $list.append($('<li/>').text(this.name));
        });
        $elem.html($list);
      });
      api.onRoomClose(function () {
        $list.remove();
      });
    }
  };
});
