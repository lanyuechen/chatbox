'use strict';

var app = angular.module('mApp', ['ngRoute','ngCookies','mCtrl','mDire','mFilter','mService']);

app.config(function ($routeProvider){
	$routeProvider
		.when('/chatbox/:uid', {templateUrl:'/App/Tpl/Chatbox/chatbox.html', controller:'ChatCtrl'})
		.when('/search', {templateUrl:'/App/Tpl/Chatbox/search.html'})
		.when('/detail', {templateUrl:'/App/Tpl/Chatbox/detail.html'})
		.when('/contact', {templateUrl:'/App/Tpl/Chatbox/contact.html'})
		// .otherwise({redirectTo: '/chatbox'});
});