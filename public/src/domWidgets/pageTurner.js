define(['apiClient', 'jquery'], function (api, $) {
  return {
    init: function ($elem) {
      api.onError(function (message) {
        alert('Error:\n\n' + message);
      });
    }
  }
});
