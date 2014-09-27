'use strict';

var app = angular.module('mApp', ['ngRoute','mCtrl','mDire','mFilter']);

app.config(['$routeProvider', function ($routeProvider){
	$routeProvider
		.when('/chatbox/:uid', {templateUrl:'/App/Tpl/Chatbox/chatbox.html', controller:'ChatCtrl'})
		// .otherwise({redirectTo: '/chatbox'});
}]);