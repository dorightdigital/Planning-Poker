angular.module('pp')
  .directive('qrcode', function () {
    return {
      scope: {
        'url': '@'
      },
      restrict: 'E',
      transclude: true,
      link: function ($scope, element) {
        function update() {
          element.text('');
          jQuery(element[0]).qrcode($scope.url);
        }

        update();
        $scope.$watch('url', function () {
          update();
        });
      }
    };
  });
