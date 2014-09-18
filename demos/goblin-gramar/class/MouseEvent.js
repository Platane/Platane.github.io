

// au cas ou
if( typeof( printOut ) == "undefined" ) var printOut = function(){};
if( typeof( clearOut ) == "undefined" ) var clearOut = function(){};


function ZMouseEvent( el ){
					
					this.element = el;
					
					this.listener = [ ];
					
					/*
					* de webbricks.org
					*/
					this.getPos = function (elem) {
						var pos={'r':0,'l':0,'t':0,'b':0};
						var tmp=elem;
					 
						do {
							pos.l += tmp.offsetLeft;
							tmp = tmp.offsetParent;
						} while( tmp !== null );
						pos.r = pos.l + elem.offsetWidth;
					 
						tmp=elem;
						do {
							pos.t += tmp.offsetTop;
							tmp = tmp.offsetParent;
						} while( tmp !== null );
						pos.b = pos.t + elem.offsetHeight;
					 
						return pos;
					};
					
					this.local = function( event ){
						var pos = this.getPos( this.element );
						return { x : (event.pageX - pos.l ), 
								 y : ( event.pageY - pos.t )};
					}
					this.mouseMove  = function (event) {
						var t = this.local( event );
						try{
						for( var i = 0 ; i < this.listener.length ; i ++ ){
							this.listener[i].mouseMove( t.x , t.y );
						}
						}catch(e){ catchError( e ); }
					}
					this.mouseDown  = function (event) {
						var t = this.local( event );
						//alert( "click sur "+t.x+"  "+t.y );
						try{
						for( var i = 0 ; i < this.listener.length ; i ++ ){
							this.listener[i].mouseDown(  t.x , t.y );
						}
						}catch(e){ catchError( e ); }
					}
					this.mouseUp  = function (event) {
						
						var t = this.local( event );
						try{
						for( var i = 0 ; i < this.listener.length ; i ++ ){
							this.listener[i].mouseUp(  t.x , t.y );
						}
						}catch(e){ catchError( e ); }
					}
					this.addListener = function( f ){
						this.listener.push( f );
					}
}
function catchError( e ){
	alert( e );
}