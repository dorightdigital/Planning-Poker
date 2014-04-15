define(['jquery', 'apiClient'], function ($, api) {
  return {
    init: function ($elem) {
      $elem.on('keyup', function (e) {
        if (e.keyCode === 13) {
          api.openRoom($(this).val());
        }
      });
    }
  }
});
