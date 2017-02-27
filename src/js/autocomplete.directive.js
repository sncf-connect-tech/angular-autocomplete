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
  function autocompleteDirective($compile, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        search: '=ngModel',
        getList: '=serviceCall',
        onSelect: '&?',
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
          $timeout(function () {
            scope.autocompleteVm.focused = false;
          }, 100);
        });

        element.bind('focus', function () {
          $timeout(function () {
            scope.autocompleteVm.focused = true;
            // scope.autocompleteVm.setAutocomplete();
          });
        });

        element.bind('keydown', function (event) {
          $timeout(function () {
            scope.autocompleteVm.focused = true;
            scope.autocompleteVm.selectWithKeyboard(event);
          });
        });

        element.bind('keyup', function () {
          $timeout(function () {
            if (!scope.autocompleteVm.focused) {
              return;
            }
            if (oldValue !== element.val()) {
              scope.autocompleteVm.setAutocomplete();
              oldValue = element.val();
            }
          });
        });

        element.after($compile(template)(scope));
      }
    };
  }

  angular
    .module('autocomplete')
    .directive('vsctAutocomplete', autocompleteDirective);

})();
