(function( DOMgrid ){

	var DOMtiles = DOMgrid.querySelectorAll('.grid-tile');


	var DomHelper = new (function(){

		this.getWidth=function( el ){
			return el.offsetWidth
		}

		this.getHeight=function( el ){
			return el.offsetHeight
		}

		this.setPosition=function( el , x , y ){
			el.style.left = x+'px'
			el.style.top = y+'px'
		}

		var transformProp = ['webkitTransform' , 'mozTransform' , 'transform' ]
		this.setPosition=function( el , x , y ){
			var value = 'translate3d(' + x + 'px,' + y + 'px,0px)'

			for( var i=transformProp.length;i--;)
				el.style[ transformProp[i] ] = value
		}
	})();


	var tilesGeom = [];
	var recompute = function( modifier ){

		// grab some values

		for(var i=0,l=DOMtiles.length;i<l;i++){
			tilesGeom[i] = tilesGeom[i] || {}

			tilesGeom[i].w = DomHelper.getWidth( DOMtiles[i] )
			tilesGeom[i].h = DomHelper.getHeight( DOMtiles[i] )

			tilesGeom[i].x = 0
			tilesGeom[i].y = 0
		}

		// comptue the best fit

		bestFit( DomHelper.getWidth( DOMgrid ) , tilesGeom );

		if( typeof modifier === 'function' )
			modifier( tilesGeom )

		// apply
		for(var i=0,l=DOMtiles.length;i<l;i++)
			DomHelper.setPosition( DOMtiles[i] , tilesGeom[i].x , tilesGeom[i].y )
	}

	var bestFit = function( w , tiles ){

		// how many collums?
		var cn = Math.floor( w/tiles[0].w + 0.05 )

		// height sum
		var hs=0
		for( var i=tiles.length;i--;)
			hs+=tiles[i].h

		// column height
		var ch = hs/cn


		// fill row first
		var tube = new Array( cn )
		for( var i=cn;i--;)
			tube[i] = (i%2)*30

		for( var i=0,l=tiles.length;i<l;i++){

			// fill the less filled tube

			var less = cn-1
			for(var j=cn-1;j--;)
				if( tube[less]>=tube[j])
					less=j


			tiles[ i ].x = less / cn * w
			tiles[ i ].y = tube[ less ]

			tube[ less ] += tiles[ i ].h
		}
	}

	


	var timeout
	window.addEventListener('resize',function(){
		clearTimeout( timeout )
		timeout = setTimeout( recompute,100 );
	},false)

	// replace, outside the screen
	recompute(function( tiles ){
		for(var i=tilesGeom.length;i--;)
			tiles[ i ].x = Math.random()<0.5 ? -window.innerWidth : window.innerWidth
	})

	// forcereflow
	var a = DOMgrid.offsetHeight;

	// make the tiles animatable
	for(var i=DOMtiles.length;i--;)
		DOMtiles[i].className += ' grid-animated'

	// replace, at correct state
	setTimeout( recompute,200 );

})( document.getElementsByClassName('grid')[0] );