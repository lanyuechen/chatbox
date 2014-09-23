'use strict';

var app = angular.module('mApp', ['ngRoute','mCtrl','mDire','mFilter']);

app.config(['$routeProvider', function ($routeProvider){
	$routeProvider
		.when('/home', {templateUrl:'/App/Tpl/User/home.html', controller:'HomeCtrl'})
		.when('/home/:appId', {templateUrl:'/App/Tpl/User/home.html', controller:'HomeCtrl'})
		.when('/newmsg/:os', {templateUrl:'/App/Tpl/User/newmsg.html', controller:'NewmsgCtrl'})
		.when('/msglog', {templateUrl:'/App/Tpl/User/msglog.html', controller:'MsgLogCtrl'})
		.when('/statis', {templateUrl:'/App/Tpl/User/statis.html', controller:'StatisCtrl'})
		.when('/pkgmanage', {templateUrl:'/App/Tpl/User/pkgmanage.html', controller:'PkgCtrl'})
		.when('/qudao', {templateUrl:'/User/qudao'})
		.when('/config', {templateUrl:'/App/Tpl/User/config.html', controller:'ConfigCtrl'})
		.when('/config/:os', {templateUrl:'/App/Tpl/User/config.html', controller:'ConfigCtrl'})
		.when('/config/:os/:appId', {templateUrl:'/App/Tpl/User/config.html', controller:'ConfigCtrl'})
		.when('/errstatis', {templateUrl:'/User/errstatis'})
		.when('/errlog', {templateUrl:'/App/Tpl/User/errlog.html', controller:'ErrlogCtrl'})
		.otherwise({redirectTo: '/home'});
}]);