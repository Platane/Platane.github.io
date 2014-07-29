(function(){

	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute('id',"svg-masking-buble-path")

	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.d="M150 0 L75 200 L225 200 Z"
	
	svg.appendChild( path )

	document.getElementsByTagName('body')[0].appendChild( svg )

	var startSvg = function(){
	}

	document.querySelectorAll( '.work-illu-secondary-group work-illu' )
})()