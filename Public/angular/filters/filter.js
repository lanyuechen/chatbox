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