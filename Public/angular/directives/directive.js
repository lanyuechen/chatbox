
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

mDire.directive('draggableY', function($document) {
  var startY=0, y = 0;
  return function(scope, element, attr) {
    element.css({
     position : 'relative'
    });
    element.bind('mousedown', function(event) {
      startY = event.screenY;
      element.css({
       'transition-duration' : '0s',
       '-moz-transition-duration' : '0s',
       '-webkit-transition-duration' : '0s',
      });
      $document.bind('mousemove', mousemove);
      $document.bind('mouseup', mouseup);
    });

    function mousemove(event) {
      y = (event.screenY - startY) * 0.3;
      element.css({
        top: y + 'px'
      });
    }

    function mouseup() {
      $document.unbind('mousemove', mousemove);
      $document.unbind('mouseup', mouseup);
      element.css({
        'transition-duration' : '0.3s',
        '-moz-transition-duration' : '0.3s',
        '-webkit-transition-duration' : '0.3s',
        top : '0px'
      });
    }
  }
});