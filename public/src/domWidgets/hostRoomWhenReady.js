define(['jquery', 'apiClient'], function ($, api) {
  return {
    init: function ($elem) {
      api.onRoomReady(function (room) {
        var portString = window.location.port === '' ? '' : (':' + window.location.port);
        var fullRoomUrl = window.location.protocol + '//' + window.location.hostname + portString + room.url;
        $elem.html($('<h1/>').text('You\'re hosting room ' + room.name));
        $elem.append($('<div/>').text('Request a vote ').append(
          $('<form/>').submit(function (e) {
            e.preventDefault();
            api.requestVotes($(this).find('input').val());
            return false;
          }).append('<input/>')));
        $elem.append($('<ul data-dom-widget="incomingParticipantRequests"/>'));
        $elem.append(
          $('<div/>')
            .append(
              $('<h3>Others can join by visiting </h3>')
                .append($('<a/>')
                  .attr('href', fullRoomUrl)
                  .text(fullRoomUrl)))
            .append($('<span data-dom-widget="showQrCode"/>').attr('data-url', fullRoomUrl)));
        $elem.append($('<div data-dom-widget="listParticipants"/>'));
        $elem.loadDomWidgets();
      });
    }
  }
});
