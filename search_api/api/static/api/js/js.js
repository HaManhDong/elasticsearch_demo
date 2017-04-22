/**
 * Created by hamanhdong on 05/04/2017.
 */

var app = angular.module('elasticSeachUI', ['ngResource', 'ngSanitize']);

app.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{d');
    $interpolateProvider.endSymbol('d}');
}]);

angular.module('elasticSeachUI').factory('RequestService', function ($resource) {

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

    vm.show_result = false;
    vm.noResult = false;
    vm.showPagePagination = false;
    vm.showToolSearch = false;

    vm.typeSearches = {
        availableOptions: [
            {id: 0, name: 'Full text search'},
            {id: 1, name: 'Title'},
            {id: 2, name: 'Content'}
        ],
        selectedOption: {id: '1', name: 'Full text search'}
    };

    vm.timeFilters = {
        availableOptions: [
            {id: 0, name: 'All time'},
            {id: 1, name: '1 week ago'},
            {id: 2, name: '1 month ago'},
            {id: 3, name: '1 year ago'}
        ],
        selectedOption: {id: '1', name: 'All time'}
    };

    document.getElementById('search').onkeypress = function (e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            // Enter pressed
            vm.search();
        }
    };

    vm.data = [];

    var count = 2;
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

        RequestService.get({
            "q": vm.search_text,
            "fieldID": vm.typeSearches.selectedOption['id'],
            "match_phrase": true
        }).$promise.then(function (result) {
            // console.log(result);
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

    vm.changeTypeSearch = function () {
        console.log(vm.typeSearches.selectedOption);
    };

    vm.changeTimeFilter = function () {
        console.log(vm.timeFilters.selectedOption);
    };

});



