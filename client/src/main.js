'use strict';

angular.module('tabsDemoDynamicHeight', ['ngMaterial']);

module.exports = function($scope, $location, $mdDialog, $mdMedia, $mdBottomSheet, Services) {

  $scope.status = ' ';
  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
  $scope.mainServerReply;
  $scope.searchInput = {
    term: '',
    location: 'Austin'
  }
  $scope.serverReply;
  $scope.toAdd;
  $scope.currentRestReview;

  $scope.showAdvanced = function(ev, restaurant) {
    Services.setCurrentRestReview(restaurant);
    console.log('firing showAdvanced');
    $mdDialog.show({
        controller: DialogController,
        templateUrl: './views/restReview.html',
        parent: angular.element(document.querySelector('#popupContainer')),
        targetEvent: ev,
        clickOutsideToClose: true
      })
  };

  $scope.goto = function(path) {
    console.log("goto worked");
    $location.path(path)
  }

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
  }


  //value bound to Restaurant/City input on restSearch.html
  $scope.searchInput = {
    term: '',
    location: 'Austin'
  };

  $scope.submitSearch = function() {
    var restRequest = {
      term: $scope.searchInput.term,
      location: $scope.searchInput.location
    };

    Services.yelpSearchResults(restRequest)
      .then(function(resp) {
        $scope.serverReply = resp.map(function(rest) {
          rest['addedToWishList'] = false;
          return rest;
        })
        console.log('Populating page with yelp results: ', $scope.serverReply);
      });
    console.log('Submitted search criterion: ', restRequest);
  };

  $scope.addToRestaurants = function(restaurant, userStat) {
      console.log('addToRestaurants fired:', restaurant);

      delete restaurant.addedToWishList;
      Services.yelpSearchAdd(restaurant, userStat)
        .then(function(resp) {
          console.log("refreshing main page after add", resp);
          restaurant.addedToWishList = true;
          $scope.init();
      });
  }

  $scope.addToBeenThere = function(restaurant) {
      console.log('addToBeenThere fired:', restaurant);
      Services.yelpBeenThere(restaurant)
        .then(function(resp) {
          console.log("refreshing main page after been there add", resp);
          $scope.init();
      });
  }

  $scope.addToWishList = function(restaurant) {
      console.log('addToBeenThere fired:', restaurant);
      Services.yelpWishList(restaurant)
        .then(function(resp) {
          console.log("refreshing main page after wishlist add", resp);
          $scope.init();
      });
  };

  $scope.writeReview = function() {
    console.log("go to create a review page for selected restaurant");
  };

  $scope.seeReview = function() {
    console.log("go to see existing review page for selected restaurant");
    Services.seeReview();
  };

  $scope.openBottomSheet = function() {
    $mdBottomSheet.show({
      template: "<md-bottom-sheet>Under Construction... (╯°□°)╯︵ ┻━┻</md-bottom-sheet>"
    });
  };
  $scope.goto = function(path) {
    console.log("goto worked");
    $location.path(path)
  };

  $scope.isInUserRests = function(restaurant) {
    return $scope.mainServerReply.find(function(rest) {
      return restaurant.yelp_id === rest.yelp_id;
    })
  }
  //docCookies is a library that implements several methods for dealing with cookies
  $scope.docCookies = {
    getItem: function(sKey) {
      if (!sKey) {
        return null;
      }
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
        return false;
      }
      var sExpires = "";
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
            break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },
    removeItem: function(sKey, sPath, sDomain) {
      if (!this.hasItem(sKey)) {
        return false;
      }
      document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
      return true;
    },
    hasItem: function(sKey) {
      if (!sKey) {
        return false;
      }
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function() {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
        aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
      }
      return aKeys;
    }
  };

  $scope.init = function() {
    console.log("init function fired to show/refresh main page after login or new restaurant add");
    if ($scope.docCookies.getItem('sessionToken') !== null) {
      $scope.mainServerReply = [];
      Services.getList()
        .then(function(resp) {
          console.log('Array of restaurants received from database :', resp);
          $scope.mainServerReply = resp;
          return resp;
        });
    }
  };

  $scope.init();

};
