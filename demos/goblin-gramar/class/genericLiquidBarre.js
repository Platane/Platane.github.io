try{

function GenericLiquidBarre( x , y , width , height , color ){
	
	// la barre à son propre layer
	this.layer = new Kinetic.Layer();
	
	this.x = x;
	this.y = y;
	
	this.color = color;
	
	this.level = 0.5;
	
	/** parametres */
	this.nombreWave = 3;
	
	this.width = width;
	this.height = height;
	
	/** proprietes locales */
	
	/* element graphique */
	this.liquid;
	
	this.bubbleGroup;
	
	/* element algorithmique */
	this.timerShake = 0;
	this.timerWave = 0;
	
	this.intervalle;
	
	this.bubbleList =[];
	
	// tableau contenant des modification à effecteur
	this.variations = [];
	
	// coefficient de maree
	this.coeffGlobal = this.width/3;	
	this.coeff = this.width/0.8;
	
	this.timerBubble = 0;
	
	if( typeof( GenericLiquidBarre.prototype.init ) == "undefined" ){
	
		GenericLiquidBarre.prototype.setLevel = function( l ){
			
			if( this.level == l )
				return
			
			var diff = Math.abs( this.level - l  )*0.5 + 0.5;
			
			this.coeffGlobal = this.width/3;
				
			this.coeff = this.width/( 0.8 ) * diff * 2;
			
			this.timerWave = 0;
			
			this.resetWaves();
			
			this.level = l;
		}
		
		GenericLiquidBarre.prototype.resetWaves = function(){
			this.intervalle = [];
			var av = 0;
			for( var i = 0 ;i < this.nombreWave ; i ++ ){
				var length = ( 1 - av ) / ( this.nombreWave -i ) * ( 0.25 + Math.random()*1 );
				if( i == this.nombreWave -1 )
					length = ( 1 - av );
				this.intervalle.push( { a : av ,  b : av + length , omega : Math.random()*0.1 + 0.02 , phase : Math.PI * Math.random() , amplitude : Math.random()*0.5 + 0.4 } );
				av += length;
			}
		}
		
		GenericLiquidBarre.prototype.eachFrame = function(){
			
			this.timerWave ++;
			
			// on introduit des variations sur l'intervalles
			var seed ;
			if( this.variations.length < 2 && ( seed = Math.random() ) > 0.95 ){
				// on va faire un agrandissement d'une fenêtre
				var timer = Math.random()*50+50;
						
				var victime = Math.floor( Math.random() * this.intervalle.length );
						
						
				if( this.intervalle[ victime ].b - this.intervalle[ victime ].a < 0.5 ) ;
						
				var nouvelle_largeur = ( 0.25 + Math.random()*1.5 ) / this.intervalle.length ;
						
				var d =  ( nouvelle_largeur -  ( this.intervalle[ victime ].b - this.intervalle[ victime ].a)  ) / timer;
						
				this.variations.push( { g : "agrandissement" ,  timer :  timer , victime : victime , nouvelle_largeur : nouvelle_largeur , d:d} );
						
			}
					
			// on effectue les variations
			var t = this;
			
			var echangeLargeur = function( i , j , l ){
					
				var tmp = new Array( t.intervalle.length );
				for( var k = 0 ; k <  t.intervalle.length  ; k ++ )
						tmp[k ] = t.intervalle[ k ].b - t.intervalle[ k ].a;
				
						
				if( tmp[ i ] + l < 0 ||tmp[ j ] - l < 0.05 )
					return
							
				tmp[ i ] += l;
				tmp[ j ] -= l;
						
						
				for( var k = 0 ; k <  t.intervalle.length  ; k ++ ){
						
					t.intervalle[ k ].b = t.intervalle[ k ].a + tmp[ k ];
							
					if( k + 1 < t.intervalle.length )
						t.intervalle[ k+1 ].a = t.intervalle[ k ].b;
				}	
			}
			
			for( var i =0 ; i < this.variations.length ; i ++ ){
				
				this.variations[ i ].timer --;
						
				if( this.variations[ i ].timer <= 0 ){
					this.variations.splice( i , 1 );
					i --;
					continue;
				}
						
				if( this.variations[ i ].g == "agrandissement" ){
						echangeLargeur( this.variations[ i ].victime , Math.floor( Math.random() * this.intervalle.length ) , this.variations[ i ].d );
				}
			}
			
			// décroissance
			if( this.coeffGlobal > this.width/50 )
				this.coeffGlobal -= ( this.coeffGlobal + 50 ) / 200;
				
			if( this.coeff > this.width/4 )
				this.coeff -= ( this.coeff + 50 ) / 100;
				
			this.layer.draw();
			
			
			//// bubble ////
			
			// faire apparaitre les bubbles
			
			this.timerBubble --;
			if( this.timerBubble <= 0 ){
				this.timerBubble = Math.floor( Math.random() * 30 )+2;
				
				var bubble = new Kinetic.Circle({
					x: Math.random() * ( this.width - 12 ) + 6,
					y: -5,
					radius: Math.random() * 5 + 2,
					stroke: "white",
					strokeWidth: Math.random() * 2 + 0.2,
					vitesse : Math.random()*0.2 + 1
				});
			
				this.bubbleGroup.add( bubble );
				
				this.bubbleList.push( bubble );
			}
			
			for( var i = 0 ; i < this.bubbleList.length ; i ++ ){
				
				
				var bubble = this.bubbleList[ i ];
				
				bubble.y -= bubble.vitesse;
				
				var h = t.level * t.height;
				
				
				if( bubble.y < -h * 0.7 )
					// fading
					bubble.alpha = Math.max( 0 , 1+ ( h * 0.7 + bubble.y ) / ( h*0.3 ) );
					
				if( bubble.y < -h ){
					//supression
					
					this.bubbleGroup.remove( bubble );
				
					this.bubbleList.splice( i , 1  );
					i--;
				}
			}
			
			
		}
		
		GenericLiquidBarre.prototype.build = function(){
		
			var t = this;
			
			this.bubbleGroup = new Kinetic.Group();
			
			// le liquid
			this.liquid = new Kinetic.Shape( {
				drawFunc : function(){
					
					
					var h = t.level * t.height + ( 1 + Math.sin( 0.17 * t.timerWave  ) ) * t.coeffGlobal * 0.5;
					
					var context = this.getContext();
					
					context.beginPath();
					context.moveTo( t.width , 0 );
					context.lineTo( 0 , 0 );
					context.lineTo( 0 , -h );
					
					
					// on dessine la courbe
					for( var i = 0 ; i < t.intervalle.length ; i ++ ){
						
						
						var amplitude = ( t.intervalle[ i ].b - t.intervalle[ i ].a ) * t.coeff * t.intervalle[ i ].amplitude;
						
						var a =	{
							x : ( t.intervalle[ i ].a + t.intervalle[ i ].b ) * t.width * 0.5 ,
							y : Math.max( Math.sin( t.intervalle[ i ].omega * t.timerWave + t.intervalle[ i ].phase ) *  amplitude + h , 0 )
						};
						
						if( a.y < 0 ) printOut( "<br>"+a.y );
						
						var bord = 0.5;
						
						context.bezierCurveTo( ( 1-bord ) * a.x + t.intervalle[ i ].a * t.width * bord ,   -h     , bord * a.x + t.intervalle[ i ].a * t.width * ( 1-bord )  ,      -a.y   , a.x                              , -a.y );
						context.bezierCurveTo( a.x * bord + t.intervalle[ i ].b * t.width *( 1- bord ) ,   -a.y   , a.x * ( 1- bord ) + t.intervalle[ i ].b * t.width * bord ,     - h     , t.intervalle[ i ].b * t.width    , -h );
						
					}
					
					context.lineTo( t.width , 0 );
					context.closePath();
					
					context.fillStyle = t.color;
					context.fill();
					context.lineWidth = 2;
					context.strokeStyle = "#403030";
					context.stroke();
					
					
				},
				x : 0,
				y : 0
			});
			
			// le fond
			var fond = new Kinetic.Rect( {
				x : -7.5,
				y : 7.5,
				width : this.width + 15,
				height : -( this.height + 15 ),
				stroke: "#403030",
                strokeWidth: 2
			} );
			
			
			
			this.layer.add( fond );
			
			this.layer.add( this.liquid );
			
			this.layer.x = this.x;
			this.layer.y = this.y;
			
			this.layer.add(  this.bubbleGroup );
			
		}
		
		GenericLiquidBarre.prototype.setColor = function( color ){
			this.color = color;
		}
		
		GenericLiquidBarre.prototype.init = true;
		
	}
	this.resetWaves();
	this.build();
	
	
}

}catch( e ){

	catchError( e );
}