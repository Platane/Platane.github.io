(function(){

	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	

	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.d="M150 0 L75 200 L225 200 Z"
	
	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("cx",100)
	circle.setAttribute("cy",100)
	circle.setAttribute("r",100)
	circle.cx = 100
	circle.cy = 100
	circle.r = 100

	var mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
	mask.setAttribute("maskUnits" , "objectBoundingBox")
	mask.setAttribute("maskContentUnits" , "objectBoundingBox")
	mask.setAttribute('id',"mask-buble-path")

	svg.appendChild( path )
	svg.appendChild( mask )

	mask.appendChild( circle )

	document.getElementsByTagName('body')[0].appendChild( svg )

	var startSvg = function(){
		//SVGPathSegMovetoAbs
	}

	var all = document.querySelectorAll( '.work-illu-secondary-group .work-illu' )

	for(var i=all.length;i--;)
		all[i]
		.addEventListener('click',function( e ){
			
			// grab the caroussel element
			var cars = this
			while(true)
				if( cars.className.indexOf('work-content-caroussel')<0 )
					cars = cars.parentElement
				else
					break;

			// grab the primar illu
			var main = cars.querySelector('.work-illu-main')

			main.querySelector('div').style.backgroundImage = this.style.backgroundImage
			main.querySelector('div').style.mask =  'url(#mask-buble-path)'

			e.stopPropagation();
		})
})()