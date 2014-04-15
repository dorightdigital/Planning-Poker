define(['jquery', 'apiClient'], function ($, api) {
  return {
    init: function ($elem) {
      api.onRoomReady(function (room) {
        var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port === '' ? '' : (':' + window.location.port)) + room.url;
        $elem.html($('<h1/>').text('You\'re hosting room ' + room.name));
        $elem.append($('<ul data-dom-widget="listParticipants"/>'));
        $elem.append($('<div><h3>Others can join by visiting ' + fullRoomUrl + '</h3><span data-dom-widget="showQrCode" data-url="' + fullRoomUrl + '"/> </div>'));
        $elem.loadDomWidgets();
      });
    }
  }
});
