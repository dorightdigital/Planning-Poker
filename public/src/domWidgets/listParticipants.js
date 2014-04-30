define(['apiClient'], function (api) {
  return {
    init: function ($elem) {
      api.onParticipantUpdate(function (participants) {
        console.log(participants);
        var $list = $('<ul/>');
        $.each(participants, function () {
          $list.append($('<li/>').text(this.name));
        });
        $elem.html($list);
      });
    }
  };
});
