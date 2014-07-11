

(function kickParallax(){


	/// polyfill
	var scrollTo=function(el,scrollx,scrolly){
      if(el.scrollTo){
        el.scrollTo(scrollx,scrolly);
        return;
      }
      if(el.scrollLeft!=null && el.scrollTop!=null){
        el.scrollLeft=scrollx;
        el.scrollTop=scrolly;
        return;
      }
      if(el.scrollX!=null && el.scrollY!=null){
        el.scrollX=scrollx;
        el.scrollY=scrolly;
        return;
      }
      throw 'unable to scroll';
    };

    var getSroll=function(el){
        if(el.scrollLeft!=null && el.scrollTop!=null)
          return {
              x:el.scrollLeft,
              y:el.scrollTop
            };
        if(el.scrollX!=null && el.scrollY!=null)
         return {
              x:el.scrollX,
              y:el.scrollY
            };
        throw 'unable to scroll';
    };

    var requestAnimFrame=(function(callback){
      return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback){
        window.setTimeout(callback, 1000 / 60 );
      };
    })();



    var slides = document.querySelectorAll('.slide');




})();