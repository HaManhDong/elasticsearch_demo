/**
 * Created by hamanhdong on 05/04/2017.
 */

var app = angular.module('elasticSeachUI', ['ngResource', 'ngSanitize']);

app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{d');
    $interpolateProvider.endSymbol('d}');
}]);

angular.module('elasticSeachUI').factory('RequestService', function ($resource) {

    // var URL = "search";
    var URL = "search";

    var header = {
        'Content-Type': 'application/json'
    };

    return $resource(URL, {}, {
        get: {
            method: 'GET',
            // data: false,
            // headers: header
        }
    });
});

app.controller('elasticSearchCtrl', function ($scope, RequestService) {
    var vm = this;

    vm.a = true;
    vm.page = 1;
    vm.show_result = false;
    vm.noResult = false;
    vm.showPagePagination = false;
    vm.showToolSearch = false;
    vm.isMatchPhase = true;

    vm.typeSearches = {
        availableOptions: [
            {id: 0, name: 'Full text search'},
            {id: 1, name: 'Title'},
            {id: 2, name: 'Content'}
        ],
        selectedOption: {id: 0, name: 'Full text search'}
    };

    vm.timeFilters = {
        availableOptions: [
            {id: 0, name: 'All time'},
            {id: 1, name: '1 week ago'},
            {id: 2, name: '1 month ago'},
            {id: 3, name: '1 year ago'}
        ],
        selectedOption: {id: 0, name: 'All time'}
    };

    document.getElementById('search').onkeypress = function (e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            // Enter pressed
            vm.search();
        }
    };

    vm.changePage = function(page){
      if(vm.page == page){
          console.log('this is concurrent page!');
          return;
      }
      if(page == 0){
          if(vm.page > 1){
              vm.page = vm.page -1;
              vm.search();
              return;
          } else {
              return;
          }
      }
      if(page == 6){
          if(vm.page < 5){
              vm.page += 1;
              vm.search();
              return;
          } else {
              return;
          }
      }
      vm.page = page;
      console.log(vm.page);
        vm.search();

    };

    function getTimeFilter() {
        var date = new Date();
        switch (vm.timeFilters.selectedOption.id) {
            case 1:
                date.setDate(date.getDate() - 7);
                break;
            case 2:
                date.setMonth(date.getMonth() - 1);
                break;
            case 3:
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                return '';
        }
        var month_Temp = '';
        if(date.getMonth() < 9){
            month_Temp = '0' + (date.getMonth() + 1);
        } else {
            month_Temp = date.getMonth() + 1;
        }
        var date_Temp = '';
        if(date.getDate() < 10){
            date_Temp = '0' + date.getDate();
        } else {
            date_Temp = date.getDate();
        }
        var date_string = date.getFullYear() + "-" +month_Temp + "-" + date_Temp;
        return date_string;
    };

    vm.data = [];

    var count = 1;
    vm.actionShowToolSearch = function () {
        if (count % 2) {
            vm.showToolSearch = true;
        } else {
            vm.showToolSearch = false;
        }
        count++;
    };

    var convertHighlightText = function (arrText) {
        var text = "";
        if (!arrText) {
            return text;
        }
        if (arrText.length == 0) {
            return text;
        }
        for (var i in arrText) {
            arrText[i] = arrText[i].replace("<em>", "<strong>");
            arrText[i] = arrText[i].replace("</em>", "</strong>");
            text = text + arrText[i] + "...";
        }
        return text;
    };

    vm.search = function () {
        if (!vm.search_text) {
            console.log("Test search is null!");
            return;
        }

        var timeFilter = '';
        if(vm.timeFilters.selectedOption.id != 0){
            timeFilter = getTimeFilter();
        }

        RequestService.get({
            "q": vm.search_text,
            "fieldID": vm.typeSearches.selectedOption['id'],
            'timeFilter': timeFilter,
            'page': vm.page,
            "match_phrase": vm.isMatchPhase
        }).$promise.then(function (result) {
            console.log(result);
            vm.show_result = true;
            if (result.data.news.length == 0) {
                vm.noResult = true;
                vm.showPagePagination = false;
                vm.data = [];
                return;
            } else {
                vm.noResult = false;
                vm.showPagePagination = true;
            }
            for (var i in result.data.news) {
                result.data.news[i].highlightText = convertHighlightText(result.data.news[i].highlight.content) || result.data.news[i].content.slice(1, 301) + "...";
                // result.data.news[i].time = result.data.news[i].time.split('T')[0];
            }
            vm.data = result.data.news;
            console.log(vm.data);
        }, function (errResponse) {
            alert("Can't search!");
            console.log(errResponse);
        });
    };

});



