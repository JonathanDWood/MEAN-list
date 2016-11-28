// Wrap in immediate function for use strict to only affect this file
(function() {
	'use strict';

	var app = angular.module('meanApp', ['ui.router']);

	app.factory('items', ['$http', function($http){
		var o = {
      items: [],
		increaseUpvotes : function(item) {
			o.upVote(item);
		},
		decreaseUpvotes : function(item) {
			o.downVote(item);
		},
		getAll : function() {
			return $http.get('/items').success(function(data) {
				angular.copy(data, o.items);
			});
		},
		create : function(item) {
			return $http.post('/items', item).success(function(data) {
				o.items.push(data);
			});
		},
		upVote : function(item) {
			return $http.put('/items/' + item._id + '/upvote')
				.success(function(data) {
					item.upvotes += 1;
				});
		},
		downVote : function(item) {
			return $http.put('/items/' + item._id + '/downvote')
				.success(function(data) {
					item.upvotes -= 1;
				});
		}
	};
		return o;
	}]);

	app.controller('MainCtrl', [
	'$scope',
	'items',
	function($scope, items) {
		$scope.items = items.items;
		$scope.i = items;
		$scope.addItem = function() {
			if (!$scope.title || $scope.title === '') { return; }
			items.create({
				title: $scope.title,
				link: $scope.link,
				upvotes: 0,
				comments: [
				]
			});
			$scope.title = '';
			$scope.link = '';
		};
	}]);

	app.controller('ItemsCtrl', [
	'$scope',
	'$stateParams',
	'items',
	function($scope, $stateParams, items) {
		$scope.i = items;
		$scope.item = items.items[$stateParams.id];
		$scope.addComment = function() {
			if ($scope.body === '') { return; }
			if ($scope.user === '') {$scope.user = 'Anonymous';}
			$scope.item.comments.push({
				body: $scope.body,
				author: $scope.user,
				upvotes: 0
			});
			$scope.body = '';
			$scope.user = '';
		};
	}]);

	app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	  $stateProvider
	    .state('home', {
	      url: '/home',
	      templateUrl: '/home.html',
	      controller: 'MainCtrl',
	      resolve: {
	      	itemPromise: ['items', function(items) {
	      		return items.getAll();
	      	}]
	      }
	    })

	    .state('items', {
	    	url: '/items/{id}',
	    	templateUrl: '/items.html',
	    	controller: 'ItemsCtrl'
	    });

	  $urlRouterProvider.otherwise('home');
	}]);

}());