var mFilter = angular.module('mFilter', []);

mFilter.filter('fullname', function() {
	return function(item){
		var str;
		if(typeof(item) == 'string'){
			str = item;
		}else{
			var str = item.join('+');
		}
		str = str.replace('i','iOS');
		str = str.replace('a','Android');
		return str;
	}
});

mFilter.filter('fix', function() {
	return function(item){
		if(item){
			return '已修复';
		}else{
			return '未修复';
		}
	}
});

mFilter.filter('verfilter', function() {
	return function(item){
		if(!item){
			return '选择版本';
		}else{
			return item;
		}
	}
});