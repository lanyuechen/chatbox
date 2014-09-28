'use strict';

var app = angular.module('mApp', ['ngRoute','mCtrl','mDire','mFilter']);

app.config(['$routeProvider', function ($routeProvider){
	$routeProvider
		.when('/chatbox/:uid', {templateUrl:'/App/Tpl/Chatbox/chatbox.html', controller:'ChatCtrl'})
		.when('/search', {templateUrl:'/App/Tpl/Chatbox/search.html', controller:'SearchCtrl'})
		.when('/detail', {templateUrl:'/App/Tpl/Chatbox/detail.html'})
		.when('/contact', {templateUrl:'/App/Tpl/Chatbox/contact.html'})
		// .otherwise({redirectTo: '/chatbox'});
}]);