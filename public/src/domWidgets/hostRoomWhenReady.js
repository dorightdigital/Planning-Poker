define(['jquery', 'apiClient'], function ($, api) {
  return {
    init: function ($elem) {
      api.onRoomReady(function (room) {
        $elem.html($('<h1/>').text('You\'re hosting room ' + room.name));
        $elem.append($('<ul data-dom-widget="listParticipants"/>'));
        $elem.append($('<div><h3>Others can join by visiting ' + room.url + '</h3><span data-dom-widget="showQrCode" data-url="' + room.url + '"/> </div>'));
        $elem.loadDomWidgets();
      });
    }
  }
});
