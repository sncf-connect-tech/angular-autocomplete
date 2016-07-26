(function () {

  'use strict';

  /**
   * @ngdoc directive
   * @name autocomplete.directive:touchStart
   * @module autocomplete
   *
   * @restrict A
   *
   * @description
   * Simple touchstart emulating directive
   */
  function touchStart() {
    return {
      restrict: 'A',
      /* @ngInject */
      controller: function ($scope, $element) {
        $element.bind('touchstart', onTouchStart);
        function onTouchStart(event) {
          var method = $element.attr('touch-start');
          $scope.$event = event;
          $scope.$apply(method);
        }
      }
    };
  }

  angular
    .module('autocomplete')
    .directive('touchStart', touchStart);

})();
