'use strict';

var mCtrl = angular.module('mCtrl',['ngCookies']);

//获取用户信息等公共信息
mCtrl.controller('RootCtrl', function ($rootScope, $cookies, localStorage){

  $rootScope.auth = function(){
    if(!$cookies.userAuth){ 
      $rootScope.me = {nick: '尚未登录', img: '/Public/img/face-default.png', sign : '请先登录...'};
      window.location.href = '#';
    }else{
      $rootScope.me = localStorage.get('me');
      $rootScope.he = localStorage.get('he');
    }
  }

  $rootScope.auth();
});

mCtrl.controller('MainCtrl', function ($rootScope, $scope, $http, $cookies, localStorage){

  //默认用户
  $scope.user = {mobile:'18310091091', password:'1'};

  //主面板选择控制
  $scope.disMainPanel = function(panel){
    // console.log($cookies.userAuth);
    if(!$cookies.userAuth){
      $scope.main = {tpl: 'login.html', panel: 'login', title: '登录'};
      return;
    }
    if(panel == 'user'){
      $scope.main = {tpl: 'user.html', panel: 'user', title: '会话'};
    }else if(panel == 'contact'){
      $scope.main = {tpl: 'contact.html', panel: 'contact', title: '联系人'};
    }else if(panel == 'care'){
      $scope.main = {tpl: 'care.html', panel: 'care', title: '关心'};
    }else if(panel == 'config'){
      $scope.main = {tpl: 'config.html', panel: 'config', title: '设置'};
    }else{
      $scope.main = {tpl: 'user.html', panel: 'user', title: '会话'};
    }
  }

  //登录
  $scope.login = function(){
    var mobile = $scope.user.mobile;
    var password = $.md5($scope.user.password);
    var param = '?mobile='+mobile+'&password='+password;
    $http.get('/Api/login' + param).success(function(data){
      if(data.code == 200){
        // console.log(data.msg);
        localStorage.set('me', data.msg);
        $rootScope.me = data.msg;
        $scope.main = {tpl: 'user.html', panel: 'user', title: '会话'};
      }
    });
  }

  //退出登录
  $scope.logout = function(){
    $http.get('/Api/logout').success(function(data){
      if(data.code == 200){
        $rootScope.me = {nick: '尚未登录', img: '/Public/img/face-default.png', sign : '请先登录...'};
        $scope.main = {tpl: 'login.html', panel: 'login', title: '登录'};
      }
    });
  }

  //滚动条
  $('.wrap').perfectScrollbar();
  
  //显示面板
  $scope.disMainPanel();
});

mCtrl.controller('UserCtrl', function ($rootScope, $scope, $http, $routeParams, localStorage){
  if(!localStorage.get('users')){
    $http.get('/Chatbox/user_chat_list').success(function(data){
      if(data.code == 200){
        localStorage.set('users', data.msg);
      }
    });
  }
  $rootScope.users = localStorage.get('users');
});

mCtrl.controller('ChatCtrl', function ($rootScope, $scope, $http, $routeParams, $cookies, localStorage){
  var uid = $routeParams.uid;
  var users = localStorage.get('users');
  var user = null;
  if(users){
    for(var i = 0; i < users.length; i++){
      if(uid == users[i].uid){
        $cookies.chatAuth = users[i].auth;
        localStorage.set('he', users[i]);
        $rootScope.he = users[i];
        break;
      }
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
      // console.log(data);
    });
  }

  $scope.getMsg = function(){
    $http.get('/Chatbox/msg?uid='+uid).success(function(data){
      // console.log(data);
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