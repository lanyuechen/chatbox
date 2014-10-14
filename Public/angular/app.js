'use strict';

var app = angular.module('mApp', ['ngRoute','ngCookies','mCtrl','mDire','mFilter','mService']);

app.config(function ($httpProvider, $routeProvider){
	$routeProvider
		.when('/chatbox/:uid', {templateUrl:'/Tpl/chatbox.html', controller:'ChatCtrl'})
		.when('/search', {templateUrl:'/Tpl/search.html'})
		.when('/detail', {templateUrl:'/Tpl/detail.html'})
		.when('/contact', {templateUrl:'/Tpl/contact.html'})
		// .otherwise({redirectTo: '/chatbox'});
	
	var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; i++){
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };
  // Override $http service's default transformRequest
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});