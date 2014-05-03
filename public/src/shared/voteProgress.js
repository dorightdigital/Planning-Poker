define(['apiClient'], function (api) {
  return function () {
    var progress = document.createElement('progress');
    api.onVotingProgressUpdate(function (percent) {
      progress.value=percent/100;
    });
    return progress;
  };
});
