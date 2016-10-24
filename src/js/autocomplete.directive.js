(function () {

  'use strict';

  /**
   * @ngdoc directive
   * @name autocomplete.directive:autocompleteDirective
   * @module autocomplete
   *
   * @requires $compile
   *
   * @restrict A
   *
   * @description
   * Autocomplete directive
   *
   * @ngInject
   */
  function autocompleteDirective($compile) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        search: '=ngModel',
        getList: '=serviceCall',
        debounce: '@?'
      },
      controller: 'AutocompleteController',
      controllerAs: 'autocompleteVm',
      bindToController: true,
      link: function (scope, element, attrs) {
        var template =
            '<ul class="autocomplete__list" ' +
            'data-ng-if="autocompleteVm.focused && autocompleteVm.results.length" ' +
            'id="{{ aria.ariaOwns }}" ' +
            'role="listbox" ' +
            'aria-expanded="{{ autocompleteVm.ariaExpanded }}"> ' +
            '<li class="autocomplete__item" role="option" ' +
              'id="result-{{ $index }}" ' +
              'aria-setsize="{{ autocompleteVm.ariaSetsize }}" '+
              'aria-posinset="{{ result.ariaPosinset }}" ' +
              'data-ng-repeat="result in autocompleteVm.results" ' +
              'data-ng-class="{ selected: autocompleteVm.selected.index === $index }" ' +
              'data-ng-mouseover="autocompleteVm.setSelected($index)" ' +
              'touch-start="autocompleteVm.confirmSelected($index)" ' +
              'data-ng-click="autocompleteVm.confirmSelected($index)" ' +
              'data-ng-bind-html="autocompleteVm.setEmphasis(result.name, autocompleteVm.search)">' +
            '</li> ' +
          '</ul>',
          oldValue = element.val();

        scope.aria = {};
        scope.aria.ariaOwns = attrs.ariaOwns || 'vsct-autocomplete';

        element.bind('blur', function () {
          scope.autocompleteVm.focused = false;
          scope.autocompleteVm.confirmSelected();
          scope.$apply();
        });

        element.bind('focus', function () {
          scope.autocompleteVm.focused = true;
          scope.autocompleteVm.setAutocomplete();
          scope.$apply();
        });

        element.bind('keydown', function (event) {
          scope.autocompleteVm.focused = true;
          scope.autocompleteVm.selectWithKeyboard(event);
          scope.$apply();
        });

        element.bind('keyup', function () {
          if (!scope.autocompleteVm.focused) {
            return;
          }
          if (oldValue !== element.val()) {
            scope.autocompleteVm.setAutocomplete();
            oldValue = element.val();
          }
          scope.$apply();
        });

        element.after($compile(template)(scope));
      }
    };
  }

  angular
    .module('autocomplete')
    .directive('vsctAutocomplete', autocompleteDirective);

})();
