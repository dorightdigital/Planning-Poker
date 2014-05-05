define(['apiClient', 'shared/voteProgress', 'shared/resultRenderer'], function (api, vp, rr) {
  return {
    init: function ($elem) {
      api.onFullVotingStatus(function (pending, voted) {
        var $pendingList = $('<ul/>');
        var $votedList = $('<ul/>');
        $.each(pending, function () {
          $pendingList.append($('<li/>').text(this));
        });
        $.each(voted, function () {
          $votedList.append($('<li/>').text(this));
        });
        $elem.html(vp());
        $elem.append($('<div><h1>Pending</h1></div>').append($pendingList));
        $elem.append($('<div><h1>Voted</h1></div>').append($votedList));
      });
      api.onRoomClose(function () {
        $elem.remove();
      });
      rr($elem);
    }
  };
});
