define(['lib/qrcode'], function (QR) {
  return {
    init: function ($elem) {
      new QR($elem[0], {text: $elem.data('url')});
    }
  };
});
