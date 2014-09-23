
var mDire = angular.module('mDire', []);

mDire.directive('draggable', function($document) {
	var startX=0, startY=0, x = 0, y = 0;
  return function(scope, element, attr) {
    element.css({
     position: 'relative',
     // border: '1px solid red',
     // backgroundColor: 'lightgrey',
     cursor: 'pointer'
    });
    element.bind('mousedown', function(event) {
      startX = event.screenX - x;
      startY = event.screenY - y;
      $document.bind('mousemove', mousemove);
      $document.bind('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.screenY - startY;
      x = event.screenX - startX;
      element.css({
        top: y + 'px',
        left:  x + 'px'
      });
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
    }
  }
});

mDire.directive('fullheight', function($document) {
  return function(scope, element, attr) {
    var height = document.documentElement.clientHeight - 182 + 'px';
    element.css({
      'min-height': height
    });
  }
});

mDire.directive('radiogroup', function($document){
  return function(scope, element, attr) {
    element.bind('click', function(){
      $('[radiogroup="'+attr.radiogroup+'"]').removeClass('active');
      element.addClass('active');
    });
  }
});

mDire.directive('radiogroup2', function($document){
  return function(scope, element, attr) {
    element.bind('click', function(){
      $('[radiogroup2="'+attr.radiogroup2+'"]').removeClass('active');
      element.addClass('active');
    });
  }
});

mDire.directive('radio', function($document){
  return function(scope, element, attr) {
    element.bind('click', function(){
      $('[radio="'+attr.radio+'"]').removeClass('checked');
      element.addClass('checked');
    });
  }
});

mDire.directive('checkbox', function($document){
  return function(scope, element, attr) {
    element.bind('click', function(){
      if(element.hasClass('checked')){
        element.removeClass('checked');
      }else{
        element.addClass('checked');
      }
    });
  }
});

mDire.directive('wordcount', function($document){
  return function(scope, element, attr) {
    element.bind('keydown', function(event){
      var e = event || window.event || arguments[0];
      if (!e || e.keyCode != 8) {
        if(element.val().length >= 140){
          return false;
        }
      }
    });
  }
});