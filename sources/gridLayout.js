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

			tilesGeom[i].large = DOMtiles[i].indexOf('tile-large')>=0
		}

		// comptue the best fit

		bestFit( DomHelper.getWidth( DOMgrid ) , tilesGeom[0].w , tilesGeom );

		if( typeof modifier === 'function' )
			modifier( tilesGeom )

		// apply
		for(var i=0,l=DOMtiles.length;i<l;i++)
			DomHelper.setPosition( DOMtiles[i] , tilesGeom[i].x , tilesGeom[i].y )
	}


	var Stack = function(){
		this._array=[]
		this.sum=0
	}
	Stack.prototype.push=function( tile ){
		this.sum += tile.h
		this._array.unshift( tile )
	}
	Stack.prototype.pop=function( ){
		var t = this.array.shift()
		this.sum -= t.h
		return t
	}
	Stack.prototype.whatIfPop=function( k ){
		var s = this.sum
		for(var i=0;i<k && i<this._array.length;i++)
			s-=this.array[i].h
		return s
	}


	var bestFit = function( w , averageW , tiles_ ){

		// how many collums?
		var cn = Math.floor( w/averageW + 0.01 )


		// fill row first
		var tube = new Array( cn );
		for( var i=cn;i--;)
			( tube[i] = new Stack() ).sum = (i%2)*30

		var tiles = tiles_.slice().reverse()

		while( tiles.length ){

			var tile = tiles.shift()

			// fill the less filled set of tubes

			var size = Math.ceil( w/averageW - 0.01 )

			if( tile.large ){



			}else{
				var less = cn-1
				for(var j=cn-1;j--;)
					if( tube[less].sum>=tube[j].sum )
						less=j

				tile.x = less / cn * w
				tile.y = tube[ less ].sum

				tube[ less ].push( tile )
			}
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