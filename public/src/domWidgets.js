require.config({
  paths: {
    "jquery": "http://code.jquery.com/jquery-1.11.0.min"
  },
  baseUrl: '/src'
});
define(['jquery'], function($) {

  $.fn.loadDomWidgets = function () {
    return this.each(function () {
      var $target = $(this);
      if ($target.length === 0) {
        return this;
      }
      var attr = $(this).attr('data-dom-widget');
      $(this).find('[data-dom-widget]').loadDomWidgets();
      if (!attr) {
        return this;
      }
      $.each(attr.split(' '), function () {
        var widgetName = ("" + this).replace(/\./g, '/');
        require(['domWidgets/' + widgetName], function (widget) {
          widget.init($target);
        });
      });
    });
  };
  $(document).ready(function () {
    $('body').loadDomWidgets();
  });
  return {};
});
