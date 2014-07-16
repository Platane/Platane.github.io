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

		this.getX=function( el ){
			var value = ""
			for( var i=transformProp.length;i--;)
				if( ( value = el.style[ transformProp[i] ] ) )
					break

			var m = value.match(/\( *([\d.-]+)/)

			return !m ? 0 : +m[1]
		}
		this.getY=function( el ){
			var value = ""
			for( var i=transformProp.length;i--;)
				if( ( value = el.style[ transformProp[i] ] ) )
					break

			var m = value.match(/\( *[\d.-]+ *px *, *([\d.-]+)/)

			return !m ? 0 : +m[1]
		}
	})();


	var tilesGeom = [];
	var recompute = function( modifier ){

		// grab some values
		var smallW = Infinity
		for(var i=0,l=DOMtiles.length;i<l;i++){
			tilesGeom[i] = tilesGeom[i] || {}

			tilesGeom[i].w = DomHelper.getWidth( DOMtiles[i] )
			tilesGeom[i].h = DomHelper.getHeight( DOMtiles[i] )

			//tilesGeom[i].x = DomHelper.getX( DOMtiles[i] )
			//tilesGeom[i].y = DomHelper.getY( DOMtiles[i] )

			tilesGeom[i].large = DOMtiles[i].className.indexOf('grid-tile-large')>=0
			//tilesGeom[i].large = DOMtiles[i].getAttribute('data-large') == 'true'

			tilesGeom[i].i = i

			if( tilesGeom[i].w< smallW )
				smallW=tilesGeom[i].w
		}

		// comptue the best fit

		bestFit( DomHelper.getWidth( DOMgrid ) , smallW , tilesGeom );

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
	Stack.prototype.first=function( ){
		return this.length() ? this._array[0] : null
	}
	Stack.prototype.length=function( ){
		return this._array.length
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


		var maxTube = function( ){
			var ii = cn-1,
				m = tubes[ii].whatIfPop( goBack[ii] )

			for(var i=cn-1;i--;){
				var tmp = tubes[i].whatIfPop( goBack[i] )
				
				if( m < tmp ){
					m = tmp
					ii = i
				}
			}

			return ii
		}

		var minTube = function(  ){
			var ii = cn-1,
				m = tubes[ii].whatIfPop( goBack[ii] )

			for(var i=cn-1;i--;){
				var tmp = tubes[i].whatIfPop( goBack[i] )
				
				if( m > tmp ){
					m = tmp
					ii = i
				}
			}

			return ii
		}

		var deltaTube = function( ){

			var max = maxTube( )
			var min = minTube( )

			return tubes[ max ].whatIfPop( goBack[ max ] ) - tubes[ min ].whatIfPop( goBack[ min ] )
		}

		var offsetY=0
		var tubes = new Array(cn)
		for(var i=cn;i--;)
			( tubes[i] = new Stack() ).sum = (i%2)*30 


		var tiles = tiles_.slice()
		while( tiles.length ){

			var tile = tiles.shift()

			if( !tile.large ){

				var less = cn-1
				for(var j=cn-1;j--;)
					if( tubes[less].sum>=tubes[j].sum )
						less=j

				tile.x = less / cn * w
				tile.y = tubes[ less ].sum

				tubes[ less ].push( tile )

			}else{

				var marge = 100
				var wishedY = tile.y;

				var bestFitness = Infinity,
					bestGoBack = [],
					bestMax

				for(var i=cn;i--;)
					bestGoBack.push(0)

				var goBack = bestGoBack.slice()
				

				while( true ){

					var imax = maxTube(),
						imin = minTube(),
						max = tubes[ imax ].whatIfPop( goBack[ imax ] ),
						min = tubes[ imin ].whatIfPop( goBack[ imin ] )

					
					if( max < wishedY + marge ){
						
						// acceptable
						var fitness  = 2 * ( max - min ) + Math.abs( wishedY - ( min+max )/2 )

						if( fitness < bestFitness ){
							bestFitness = fitness
							bestGoBack = goBack.slice()
							bestMax = max
						}
					}

					// early exit
					if( wishedY - ( min+max )/2 > bestFitness )
						break;


					// determine what to pop
					var f = Infinity,
						incr=-1;
					for(var i=cn;i--;){

						if( goBack[i] >= tubes[i].length()  )
							continue

						goBack[i] ++ 
						var tmp = deltaTube()
						goBack[i] --

						if( tmp < f ){
							incr = i
							f = tmp
						}
					}

					if( incr == -1 )
						break

					goBack[incr]++
				}

				var trash = []
				for(var i=cn;i--;)
					for( var k=bestGoBack[i];k--;)
						trash.push(  tubes[i].pop()  )

				trash = trash.sort( function(a,b){
					return a.i < b.i ? 1 : -1
				})

				tiles = trash.concat( tiles )


				tile.x = 0
				tile.y = Math.max( bestMax , ( wishedY + bestMax ) /2 )



				for(var i=cn;i--;)
					tubes[i].sum = tile.y + tile.h

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
	for(var i=DOMtiles.length;i--;){
		DOMtiles[i].className += ' grid-animated'
		DOMtiles[i].style.transitionDelay = ( (Math.random() * 100)|0)+"ms"
	}

	// replace, at correct state
	setTimeout( recompute,200 );





	for(var i=DOMtiles.length;i--;){

		DOMtiles[i].setAttribute('data-i',i)
		DOMtiles[i].addEventListener('click',function(){

			var largen = !( this.className.indexOf('tile-large') >= 0 )
			/*
			if( largen )
				this.setAttribute('data-large',true)
			else
				this.setAttribute('data-large',false)
			*/
			if( largen ){
				
				for(var i=DOMtiles.length;i--;)
					DOMtiles[i].className = DOMtiles[i].className.split('grid-tile-large').join('')
				recompute();
				
				this.className += ' grid-tile-large'
			}
			else
				this.className = this.className.split('grid-tile-large').join('')

			recompute();

			
			
		},false)
	}

})( document.getElementsByClassName('grid')[0] );