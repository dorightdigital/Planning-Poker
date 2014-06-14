define(['apiClient'], function (api) {
  return function ($elem) {
    api.onUnanimousResult(function (value) {
      console.log('unan result');
      $elem.html('<h1>Congrats, it was unanimous.  Everyone voted ' + value + '</h1>');
    });
    api.onMixedResult(function (results) {
      console.log('mixed result');
      $list = $('<ul/>');
      $.each(results, function (key, value) {
        $list.append($('<li/>')
          .text(key + ': ' + value.join(', ')));
      });
      $elem.html('<h1>Not everyone agreed.</h1>').append($list);
    });
  };
});
