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

			tilesGeom[i].large = DOMtiles[i].className.indexOf('grid-tile-large')>=0
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
		var t = this._array.shift()
		this.sum -= t.h
		return t
	}
	Stack.prototype.whatIfPop=function( k ){
		var s = this.sum
		for(var i=0;i<k && i<this._array.length;i++)
			s-=this._array[i].h
		return s
	}


	var bestFit = function( w , averageW , tiles_ ){

		// how many collums?
		var cn = Math.floor( w/averageW + 0.01 )



		var offsetY=0
		var tiles = tiles_.slice()
		while( tiles.length ){

			// get the first large one
			for( var i=0,l=tiles.length;i<l;i++)
				if( tiles[i].large )
					break

			if( i<l ){
				// i is the large one

				var frag = tiles.slice( 0,i )
				var large = tiles[ i ]

				var best = partialBestFit( cn , frag , offsetY===0 );

				var max = 0
				var n=0
				for( var k=cn;k--;){
					var s= offsetY===0 ? (k%2)*30 : 0
					for( var j=best[k].length;j--;){
						best[k][j].x = averageW * k
						best[k][j].y =  s
						s+= best[k][j].h
						n++
					}
					if( s > max )
						max = s
				}

				tiles = frag.slice(n).concat( tiles.slice( i+1 ) )

				large.x = 0
				large.y = max

				offsetY += max + large.h

			} else {

				var tubes = new Array(cn)
				for(var i=cn;i--;)
					( tubes[i] = new Stack() ).sum = offsetY===0 ?  (i%2)*30 : offsetY


				while( tiles.length ){

					var tile = tiles.shift()

					var less = cn-1
					for(var j=cn-1;j--;)
						if( tubes[less].sum>=tubes[j].sum )
							less=j

					tile.x = less / cn * w
					tile.y = tubes[ less ].sum

					tubes[ less ].push( tile )

				}

			}
		}
	}
	var partialBestFit = function( nc , tiles , offset ){

		var sum=0
		for(var i=tiles.length;i--;)
			sum += tiles[i].h

		var tubes = new Array(nc)
		for(var i=nc;i--;)
			( tubes[i] = new Stack() ).sum = offset ?  (i%2)*30 : 0

		var best = [],bestF=Infinity;

		var k=0;
		var rec = function(){

			// analyze the current state
			var max=nc-1,
				min=nc-1

			for(var i=nc;i--;){
				if( tubes[ i ].sum < tubes[ min ].sum )
					min = i
				if( tubes[ i ].sum > tubes[ max ].sum )
					max = i
			}

			// fitness
			var f = 2 * ( tubes[max].sum - tubes[min].sum )  +  ( tiles.length - k ) * ( sum / tiles.length )

			// save the best one
			if( f < bestF ){
				bestF = f;
				best=[]
				for(var i=nc;i--;)
					best.push( tubes[i]._array.slice() )
			}


			// stop generate
			if( tubes[max].sum > sum / nc + 200 )
				return

			// place the k tiles, rec
			k++;
			if( k<tiles.length )
				for(var i=nc;i--;){

					tubes[i].push( tiles[k] )
					rec();
					tubes[i].pop( )
				}

			k--;
		}
		rec();

		return best;
	}

	/*
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
	*/
	


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





	for(var i=DOMtiles.length;i--;)
		DOMtiles[i].addEventListener('click',function(){
			if( this.className.indexOf('tile-large') >= 0 )
				this.className = this.className.split('grid-tile-large').join('')
			else
				this.className += ' grid-tile-large'

			recompute();
		},false)

})( document.getElementsByClassName('grid')[0] );