(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name autocomplete
   *
   * @description
   * Autocomplete module
   */
  angular.module('autocomplete', []);

})();

(function () {

  'use strict';

  /**
   * @ngdoc controller
   * @name autocomplete.controllers:AutocompleteController
   * @module autocomplete
   *
   * @requires $timeout
   * @requires $sce
   * @requires $attrs
   *
   * @description
   * Main controller for autocomplete
   *
   * @ngInject
   */
  function AutocompleteController($timeout, $sce, $attrs) {
    var vm = this;
    var _reqTimeout, _reqVal, _blocked = false,
      debounce = +vm.debounce || 300;

    vm.results = [];
    vm.focused = false;
    vm.ariaExpanded = false;
    vm.selected = {
      index: 0
    };

    vm.displayList = displayList;
    vm.setAutocomplete = setAutocomplete;
    vm.setEmphasis = setEmphasis;
    vm.selectWithKeyboard = selectWithKeyboard;
    vm.setSelected = setSelected;
    vm.confirmSelected = confirmSelected;

    function displayList(results) {
      var i,
        resultsCount = results.length,
        currentPosition = 0;

      vm.ariaExpanded = true; // Inform screenreader that the results are available
      for (i = 0; i < resultsCount; i++) {
        if (results && results.length) {
          currentPosition++;
          // posinset (current position) ARIA attributes
          results[i].ariaPosinset = currentPosition;
        }
      }

      // Computing values for setsize (options count) ARIA attributes
      vm.ariaSetsize = resultsCount;
      vm.results = results;
      vm.selected.index = -1; // As per ARIA spec, the first element shouldn't be selected by default
    }

    function setAutocomplete() {
      if (!vm.search || vm.search.length < 3) {
        $timeout.cancel(_reqTimeout);
        vm.ariaExpanded = false;
        vm.results = [];
        _blocked = false;
        vm.selected.index = -1; // As per ARIA spec, the first element shouldn't be selected by default
        return;
      }
      if (_blocked) {
        return;
      }
      _reqVal = vm.search;
      _blocked = true;
      getList();
      _reqTimeout = $timeout(function () {
        _blocked = false;
        if (vm.focused && ( vm.search !== _reqVal)) {
          setAutocomplete();
        }
      }, debounce);

      $attrs.$set('ariaActivedescendant', null);

      function getList() {
        vm.getList(
          vm.search,
          function (results) {
            if (vm.focused) {
              vm.displayList(results);
            }
          }
        );
      }
    }

    function setEmphasis(s, search) {
      if (typeof search !== 'string') {
        return;
      }
      var cleanedSearch = search.replace(/[(|)]/g, '');
      cleanedSearch = cleanedSearch.replace(/\s$/, '');
      var regex = new RegExp('(' + cleanedSearch + ')', 'gi');
      var mark = s.replace(regex, '<mark>$1</mark>');
      return $sce.trustAsHtml(mark);
    }

    function selectWithKeyboard(event) {
      var prevent = false;
      if (vm.results.length === 0) {
        return;
      }

      switch (event.which) {
        case 38: // ArrowUp
          if (vm.selected.index > 0) {
            vm.selected.index--;
          }
          else if (vm.results[0].results.length > 0) {
            vm.selected.index = vm.results.length - 1;
          }
          prevent = true;
          break;
        case 40: // ArrowDown
          if (vm.selected.index < vm.results.length - 1) {
            vm.selected.index++;
          }
          else if (vm.results.length > 0) {
            vm.selected.index = 0;
          }
          prevent = true;
          break;
        case 13: // Enter
          vm.confirmSelected();
          prevent = true;
          break;
        case 9: // Tab
          vm.confirmSelected();
          break;
        default:
          break;
      }

      if (prevent) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();
      }

      $attrs.$set('ariaActivedescendant', 'result-' + vm.selected.index);
    }

    function setSelected(index) {
      vm.selected.index = index;
    }

    function confirmSelected() {
      vm.search = (!vm.results.length || vm.selected.index === -1) ? vm.search : vm.results[vm.selected.index].name;
      vm.results = [];
      vm.focused = false;
    }
  }
  AutocompleteController.$inject = ['$timeout', '$sce', '$attrs'];

  angular
    .module('autocomplete')
    .controller('AutocompleteController', AutocompleteController);

})();

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
              'touch-start="autocompleteVm.setSelected($index)" ' +
              'data-ng-click="autocompleteVm.confirmSelected()" ' +
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
  autocompleteDirective.$inject = ['$compile'];

  angular
    .module('autocomplete')
    .directive('vsctAutocomplete', autocompleteDirective);

})();

(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name autocomplete.StationFinderService
   * @module autocomplete
   *
   * @requires $window
   *
   * @description
   * Initialize and comunnication with 3rd plugin stationFinder
   *
   * @ngInject
   */
  function StationFinderService($window) {
    return {
      isAvailable: function () {
        return ($window.STF_WIDGET !== null);
      },
      set: function (search, callback) {
        if ($window.STF_WIDGET === null) {
          return;
        }
        $window.STF_WIDGET.show(
          function (data) {
            callback(data);
          },
          search
        );
      }
    };
  }
  StationFinderService.$inject = ['$window'];

  angular
    .module('autocomplete')
    .factory('StationFinderService', StationFinderService);

})();

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
      controller: ['$scope', '$element', function ($scope, $element) {
        $element.bind('touchstart', onTouchStart);
        function onTouchStart(event) {
          var method = $element.attr('touch-start');
          $scope.$event = event;
          $scope.$apply(method);
        }
      }]
    };
  }

  angular
    .module('autocomplete')
    .directive('touchStart', touchStart);

})();

(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name autocomplete.TranslationService
   * @module autocomplete
   *
   * @description
   * Translation for autocomplete directive
   *
   * @ngInject
   */
  function TranslationService() {

    var lang = 'en',
        I18N = {
          BEGIN_WITH: {
            fr: 'Commençant par',
            en: 'Starts with',
            es: 'que empieza por',
            it: 'comincia per',
            nl: 'Begint met',
            de: 'Beginnt mit'
          },
          CONTAINING: {
            fr: 'Contenant',
            en: 'Contains',
            es: 'que contiene',
            it: 'contiene',
            nl: 'Bevat',
            de: 'Enthält'
          },
          EQUIVALENT: {
            fr: 'Commençant par équivalent',
            en: 'Starts with',
            es: 'que empieza por',
            it: 'comincia per',
            nl: 'Begint met',
            de: 'Beginnt mit'
          },
          CONTAINING_EQUIVALENT: {
            fr: 'Contenant équivalent',
            en: 'Contains',
            es: 'que contiene',
            it: 'contiene',
            nl: 'Bevat',
            de: 'Enthält'
          },
          STATION_FINDER: {
            fr: 'Trouver votre gare',
            en: 'Find your station',
            es: 'Encuentre su estación',
            it: 'Trova la stazione',
            nl: 'Zoek uw station',
            de: 'Finden Sie Ihr Station'
          }
        };

    return {
      get: function (_label, _lang) {
        if (!I18N.hasOwnProperty(_label)) {
          return '';
        }
        if (typeof _lang === 'undefined') {
          _lang = lang;
        }
        if (!I18N[_label].hasOwnProperty(_lang)) {
          return I18N[_label][lang];
        }

        return I18N[_label][_lang];
      }
    };
  }

  angular
    .module('autocomplete')
    .factory('TranslationService', TranslationService);

})();
