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

		this.getXOffset=function( el ){
			return el.offsetLeft
		}

		this.hasClass = function( el , c ){
			return el.classList.contains(c)
		}
		this.addClass = function( el , c ){
			el.className += ' '+c
		}
		this.removeClass = function( el , c ){
			el.className = el.className.split( c ).join('')
		}
		this.getParent = function( el , c ){
			while(true)
				if( el && !this.hasClass( el , c ) )
					el = el.parentElement
				else
					break;
			return el
		}
		this.bind = function( el , eventName , fn ){
			
			var l = eventName.split(' ')
			if( l.length>1 ){
				for(var i=l.length;i--;)
					this.bind( el , l[i] , fn )
				return
			}


			el._bindHandlers = el._bindHandlers || {}

			this.unbind( el , eventName )

			el.addEventListener( eventName.split('.')[0] , fn , false )
			el._bindHandlers[ eventName ] = fn
		}
		this.unbind = function( el , eventName ){
			
			var l = eventName.split(' ')
			if( l.length>1 ){
				for(var i=l.length;i--;)
					this.unbind( el , l[i] )
				return
			}

			if( !el._bindHandlers || !el._bindHandlers[ eventName ] )
				return 

			el.removeEventListener( eventName.split('.')[0] , el._bindHandlers[ eventName ] , false )
			el._bindHandlers[ eventName ] = null
		}
	})();