define(['apiClient'], function (api) {
  return {
    init: function ($elem) {

      $elem.append($('<div/>').text('Request a new vote ').append(
        $('<form/>').submit(function (e) {
          e.preventDefault();
          api.requestVotes($(this).find('input').val());
          return false;
        }).append('<input/>')).append($('<div data-dom-widget="fullVoteStatus"/>').loadDomWidgets()));
    }
  };
});
