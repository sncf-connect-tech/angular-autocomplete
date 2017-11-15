angular-autocomplete module
===========================

```
bower install git@github.com:voyages-sncf-technologies/angular-autocomplete.git
npm install
grunt
```

Needed files
------------
#### CSS
```
<!-- CSS -->
<link rel="stylesheet" type="text/css" href="dist/angular-autocomplete.css">
```
#### JavaScript
```
<!-- angular-autocomplete module (generated file) -->
<script src="dist/js/angular-autocomplete.js"></script>
```

Your service
------------
You have two ways to call your own service:
1. Put it in **dist/js/autocomplete.service.js**
2. Or call an AngularJS function of your choice

#### js/autocomplete.service.js
You will put your own service in **dist/js/autocomplete.service.js**.
Then you'll have to run grunt again to update concatenated file **dist/js/angular-autocomplete.js**.
```
(function() {

  'use strict';

  function AutocompleteService () {
    return {
      get: function (search, callback) {
        // Your service goes here
        // You have to create an object that complies with this mock structure
        var results = [
          {
            "label": "firstList",
            "results": [
              {
                "country": "FR",
                "uicCode": "95027146",
                "name": "Paris (Toutes gares intramuros)"
              },
            ]
          },
          {
            "label": "secondList",
            "results": [
              {
                "country": "FR",
                "uicCode": "77011184",
                "name": "Gare d'Austerlitz (Paris)"
              },
              {
                "country": "FR",
                "uicCode": "77011184",
                "name": "Gare de Bercy (Paris)"
              }
            ]
          }
        ];
        // And pass it to the callback
        callback(results);
      }
    };
  }

  angular
    .module('autocomplete')
    .factory('AutocompleteService', AutocompleteService);

})();
```

#### Call an AngularJS function
###### Directive call
```
<div ng-controller="AnotherController as daddyCtrl">
  <input type="text"
    ...
    service-call="daddyCtrl.getList"
    ...
  >
</div>
```
###### Function definition
```
// In AnotherController
$scope.getList = function (search, callback) {
  // Your service goes here
  // You have to create an object that complies with this mock structure
  var results = [
    {
      "label": "firstList",
      "results": [
        {
          "country": "FR",
          "uicCode": "95027146",
          "name": "Paris (Toutes gares intramuros)"
        },
      ]
    }
  ];
  // And pass it to the callback
  callback(results);
};
```

Use
---
#### Attributes
```
<form ng-app="autocomplete|your own module">
  ...
  <autocomplete
    name="'string with simple quotes'|reference to an angular property"
    ng-model="reference to an angular property"
    service-call="reference to an angular function"
    placeholder="'string with simple quotes'|reference to an angular property"
    required="boolean"
  >
  </autocomplete>
  ...
</form>
```
#### Default values
>**name** is the only mandatory field.

```
name: no default value
ng-model: no default value
service-call: no default value
placeholder: ""
required: false
```
