'use strict';

var mCtrl = angular.module('mCtrl',[]);

//获取用户信息等公共信息
mCtrl.controller('RootCtrl', function ($rootScope, $http, $cookies){

  $rootScope.auth = function(){
    $http.get('/Api/auth').success(function(data){
      if(data.code == 200){
        $rootScope.meAuth = data.msg.user.auth;
        $rootScope.me = data.msg.user;
      }else{
        $rootScope.me = {nick: '尚未登录', img: '/Public/img/face-default.png', sign : '请先登录...'};
      }
    });
  }

  $rootScope.auth();
});

mCtrl.controller('MainCtrl', function ($rootScope, $scope, $http, $cookies){

  //主面板选择
  $scope.disMainPanel = function(panel){
    if(!$cookies.userAuth){
      $scope.main = {tpl: 'login.html', panel: 'login', title: '登录'};
      return;
    }
    if(panel == 'user'){
      $scope.main = {tpl: 'user.html', panel: 'user', title: '会话'};
    }else if(panel == 'contact'){
      $scope.main = {tpl: 'contact.html', panel: 'contact', title: '联系人'};
    }else if(panel == 'care'){
      $scope.main = {tpl: 'care.html', panel: 'care', title: '关系'};
    }else if(panel == 'config'){
      $scope.main = {tpl: 'config.html', panel: 'config', title: '设置'};
    }else{
      $scope.main = {tpl: 'user.html', panel: 'user', title: '会话'};
    }
  }

  $scope.disMainPanel();
});

mCtrl.controller('LoginCtrl', function ($rootScope, $scope, $http){
  $scope.user = {mobile:'18310091091', password:'1'};
  $scope.login = function(){
    var mobile = $scope.user.mobile;
    var password = $.md5($scope.user.password);
    var param = '?mobile='+mobile+'&password='+password;
    $http.get('/Api/login' + param).success(function(data){
      // console.log(data);
      if(data.code == 200){
        $rootScope.meAuth = data.msg.auth;
        $rootScope.me = data.msg;
      }
    });
  }
});

mCtrl.controller('UserCtrl', function ($rootScope, $scope, $http, $routeParams){
  $http.get('/Chatbox/user_chat_list').success(function(data){
    console.log(data);
    if(data.code == 200){
      $rootScope.users = data;
    }
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
    if(param.desc == ''){
      return;
    }
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

mCtrl.controller('SearchCtrl', function ($rootScope, $scope, $http, $routeParams){

});