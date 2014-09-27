'use strict';

var mCtrl = angular.module('mCtrl',[]);

//获取用户信息等公共信息
mCtrl.controller('RootCtrl', function ($rootScope, $http, $routeParams){
  $rootScope.me = {
    uid : '1',
    nick : 'nick1',
    img : '/Public/img/face.jpg',
    mobile : '18310091096'
  }
  $rootScope.he = {
    uid : '',
    nick : '',
    img : '',
    mobile : ''
  }
  $rootScope.users = [];
});

mCtrl.controller('MainCtrl', function ($scope, $http, $routeParams){
  $scope.main = {
  	tpl : 'user.html',
  	panel : 'user',
  	title : '会话'
  };
});

mCtrl.controller('UserCtrl', function ($rootScope, $scope, $http, $routeParams){
  $http.get('/Chatbox/user_chat_list').success(function(data){
    console.log(data);
    $rootScope.users = data;
  });
});

//获取聊天内容列表,收发消息
mCtrl.controller('ChatCtrl', function ($rootScope, $scope, $http, $routeParams){
  var uid = $routeParams.uid || '';
  var users = $rootScope.users;
  var user = null;
  //获取当前用户
  for(var i = 0; i < users.length; i++){
    if(uid == users[i].uid){
      $rootScope.he = users[i];
      break;
    }
  }

  $scope.msg = {
    title : 'title',
    desc : '',
    type : 104
  };

  $('.wrap').perfectScrollbar();

  $scope.sendMsg = function(){
    var param = {
      uid_from : $rootScope.he.group,
      uid_to : $rootScope.he.uid,
      title : $scope.msg.title,
      desc : $scope.msg.desc,
      type : $scope.msg.type
    };
    $http.post('/Chatbox/msg_s2c', param).success(function(data){
      console.log(data);
    });
  }

  $scope.getMsg = function(){
    $http.get('/Chatbox/msg?uid='+uid).success(function(data){
      console.log(data);
      for(var i = 0; i < data.length; i++){
        if(data[i].uid_from == $rootScope.me.uid){
          data[i].reverse = true;
          data[i].img = $rootScope.me.img;
        }else{
          data[i].reverse = false;
          data[i].img = $rootScope.he.img;
        }
      }
      $scope.msgs = data;
    });
  }
});