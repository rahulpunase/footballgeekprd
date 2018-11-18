$.fn.moveBk=function(option){
  var me=this;
  var onX=0;
  var onY=0;
  var _deltaX=0;
  var _deltaY=0;
  var mDX=0;
  var mDY=0;
  var ifMouseDown=false;
  var settings=$.extend({
      X:0,
      Y:0
  }, option);
  me.css({
      'cursor':'move'
  });
  me.on('mousedown', function(e){
      ifMouseDown=true;
      var inn=$(this);
      onX=parseInt(getCurrent(inn)[0].replace("px", ""));
      onY=parseInt(getCurrent(inn)[1].replace("px", ""));
      mDX=e.pageX;
      mDY=e.pageY;
  });
  me.on('mouseup', function(){
      ifMouseDown=false;
  });
  me.on('mousemove', function(e){
      var inn=$(this);
      if(ifMouseDown){
          _deltaX=e.pageX;
          _deltaY=e.pageY;
          var toMoveX=onX+_deltaX-mDX;
          var toMoveY=onY+_deltaY-mDY;
      inn.css({
          'background-position':toMoveX+'px '+toMoveY+'px'
      });

      }
  });
  function getCurrent(me){
      return me.css('background-position').split(" ");
  }
};

//$.fn.moveBk=function(n){var o=this,e=0,p=0,s=0,i=0,t=0,a=0,r=!1,c=$.extend({X:0,Y:0},n);function u(n){return n.css("background-position").split(" ")}o.css({"background-position":c.X+"px "+c.Y+"px",cursor:"move"}),o.on("mousedown",function(n){r=!0;var o=$(this);e=parseInt(u(o)[0].replace("px","")),p=parseInt(u(o)[1].replace("px","")),t=n.pageX,a=n.pageY}),o.on("mouseup",function(){r=!1}),o.on("mousemove",function(n){var o=$(this);if(r){s=n.pageX,i=n.pageY;var c=e+s-t,u=p+i-a;o.css({"background-position":c+"px "+u+"px"})}})};
