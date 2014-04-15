define(['apiClient', 'jquery'], function (api, $) {
  return {
    init: function ($elem) {
      api.onError(function (message) {
        console.warn('Error', message);
      });
    }
  }
});
