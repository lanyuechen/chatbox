'use strict';

var mCtrl = angular.module('mCtrl',[]);
var server = "http://localhost";

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
    if(!$cookies.userAuth){
      $scope.main = {tpl: '/Tpl/login.html', panel: 'login', title: '登录'};
      return;
    }
    if(panel == 'user'){
      $scope.main = {tpl: '/Tpl/user.html', panel: 'user', title: '会话'};
    }else if(panel == 'contact'){
      $scope.main = {tpl: '/Tpl/contact.html', panel: 'contact', title: '联系人'};
    }else if(panel == 'care'){
      $scope.main = {tpl: '/Tpl/care.html', panel: 'care', title: '关心'};
    }else if(panel == 'config'){
      $scope.main = {tpl: '/Tpl/config.html', panel: 'config', title: '设置'};
    }else{
      $scope.main = {tpl: '/Tpl/user.html', panel: 'user', title: '会话'};
    }
  }

  //登录
  $scope.login = function(){
    var mobile = $scope.user.mobile;
    var password = $.md5($scope.user.password);
    var param = '?mobile='+mobile+'&password='+password;
    $http.get(server + '/Api/login' + param).success(function(data){
      if(data.code == 200){
        console.log(data.msg);
        $cookies.userAuth = data.msg.auth;
        localStorage.set('me', data.msg);
        $rootScope.me = data.msg;
        $scope.main = {tpl: '/Tpl/user.html', panel: 'user', title: '会话'};
      }
    });
  }

  //退出登录
  $scope.logout = function(){
    // $http.get(server + '/Api/logout').success(function(data){
    //   if(data.code == 200){
        $cookies.userAuth = "";
        $rootScope.me = {nick: '尚未登录', img: '/Public/img/face-default.png', sign : '请先登录...'};
        $scope.main = {tpl: '/Tpl/login.html', panel: 'login', title: '登录'};
        window.location.href = '#';
    //   }
    // });
  }

  //滚动条
  $('.wrap').perfectScrollbar();
  
  //显示面板
  $scope.disMainPanel();
});

mCtrl.controller('UserCtrl', function ($rootScope, $scope, $http, $routeParams, $cookies, localStorage){
  var users = false;//localStorage.get('users');
  if(users){
    $rootScope.users = localStorage.get('users');
  }else{
    var auth = $cookies.userAuth
    $http.get(server + '/Api/user_chat_list?auth='+auth).success(function(data){
      if(data.code == 200){
        localStorage.set('users', data.msg);
        $rootScope.users = data.msg;
      }
    });
  }
});

mCtrl.controller('ContactCtrl', function ($scope, $http, $cookies, localStorage){
  $http.get(server + '/Api/userlist?auth=' + $cookies.userAuth).success(function(data){
    if(data.code == 200){
      $scope.users = data.msg;
      localStorage.set('users', data.msg);
    }
  });
});

mCtrl.controller('ChatCtrl', function ($rootScope, $scope, $interval, $http, $routeParams, $cookies, localStorage){
  var uid = $routeParams.uid;
  var users = localStorage.get('users');
  if(users){
    for(var i = 0; i < users.length; i++){
      if(uid == users[i]._id || uid == users[i].uid){
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

  var websocket = null;

  $('.wrap').perfectScrollbar();

  $scope.closeChat = function(){
    websocket.close(); 
    localStorage.rm('he');
    window.location.href = '#';
  }

  $scope.msgs = {};

  $scope.sock = function(){
    console.log("[start]");
    var wsUri ="ws://localhost/socket"; 
    websocket = new WebSocket(wsUri); 
    websocket.onopen = function(evt) {
      console.log("[connected]");
    }; 
    websocket.onclose = function(evt) {
      console.log("[disconnected]");
    }; 
    websocket.onmessage = function(evt) {
      console.log('[response]'+ evt.data); 
      var res = eval('('+evt.data+')');
      if($rootScope.me.uid == res.uid_to){
        if(res.uid_from == $rootScope.me.uid){
          res.reverse = true;
          res.img = $rootScope.me.img;
        }else{
          res.reverse = false;
          res.img = $rootScope.he.img;
        }
        var tmp = $scope.msgs[$rootScope.he.uid] || [];
        console.log(tmp)
        $scope.msgs[$rootScope.he.uid] = tmp.concat(res);
        $scope.$digest();
      }
    }; 
    websocket.onerror = function(evt) {
      console.log('[error]'+ evt.data); 
      websocket.close(); 
    }; 
  }

  $scope.sock();

  $scope.sendMsg = function(){
    if(!websocket){
      $scope.sock();
    }
    if(websocket.readyState == 1){
      var tmp = $scope.msgs[$rootScope.he.uid] || [];
      var param = {
        uid_from : $rootScope.me.uid,
        uid_to : $rootScope.he.uid,
        title : $scope.msg.title,
        desc : $scope.msg.desc,
        type : $scope.msg.type
      };
      websocket.send(JSON.stringify(param));
      param.reverse = true;
      param.img = $rootScope.me.img;
      $scope.msgs[$rootScope.he.uid] = tmp.concat(param);
    }
  }

  //聊天内容更新自动滚动视口到最底端
  $scope.$on('ngRepeatFinished', function(){
    var wrap = $(".panel-content .wrap");
    wrap.scrollTop(wrap.prop('scrollHeight'));
  });
});

mCtrl.controller('SearchCtrl', function ($scope, $http, $cookies){

});