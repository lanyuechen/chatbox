
var mService = angular.module('mService',[]);

mService.factory('localStorage', function() {
	if(window.localStorage){
		var s = window.sessionStorage;
		var set = function(key, val, local){
			s = local ? window.localStorage : window.sessionStorage;
	    s.setItem(key, JSON.stringify(val));
  	};
  	var get = function(key){
  		return JSON.parse(s.getItem(key));
  	};
  	var rm = function(key){
  		s.removeItem(key);
  	};
  	return {set: set, get: get, rm: rm};
	}else{
		//不支持本地存储，使用其他方式存储
		return {set:function(){},get:function(){},rm:function(){}};
	}

}); 