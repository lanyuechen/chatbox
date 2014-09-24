'use strict';

var mCtrl = angular.module('mCtrl',[]);

mCtrl.controller('MsgCtrl', function ($scope, $http, $routeParams){
  
  var appId = $routeParams.appId || '';
  $http.get('/Chatbox/msg').success(function(data){
    console.log(data);
  });

});