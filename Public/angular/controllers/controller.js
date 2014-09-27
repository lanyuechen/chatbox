'use strict';

var mCtrl = angular.module('mCtrl',[]);

mCtrl.controller('RootCtrl', function ($rootScope, $http, $routeParams){
  $rootScope.users = [{
  	uid : '1',
  	img : '/Public/img/face.jpg',
  	nick : '阿拉甲',
  	latestMsg : '我还有最后一句话...'
  },{
  	uid : '2',
  	img : '/Public/img/face.jpg',
  	nick : '阿拉乙',
  	latestMsg : '我也还有最后一句话...'
  }];
});

mCtrl.controller('MsgCtrl', function ($scope, $http, $routeParams){
  
  $http.get('/Chatbox/msg').success(function(data){
    console.log(data);
  });

});

mCtrl.controller('MainCtrl', function ($scope, $http, $routeParams){
  $scope.main = {
  	tpl : 'user.html',
  	panel : 'user',
  	title : '会话'
  };
});

mCtrl.controller('UserCtrl', function ($rootScope, $scope, $http, $routeParams){
  
});

mCtrl.controller('ChatCtrl', function ($rootScope, $scope, $http, $routeParams){

	var uid = $routeParams.uid || '';
	for(var i = 0; i < $rootScope.users.length; i++){
		if(uid == $rootScope.users[i].uid){
			$scope.user = $rootScope.users[i];
			break;
		}
	}
  
});