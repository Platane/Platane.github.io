
var catchError= function( e )  { alert( e ) }; 

try{


// au cas ou
if( typeof( printOut ) == "undefined" ) var printOut = function(){};
if( typeof( clearOut ) == "undefined" ) var clearOut = function(){};



function caroussel ( stage , element_srcHTML  ){


function delaiBienPratique( timer , callBack , o ) { 
	this.o = o; 
	this.callBack = callBack; 
	this.timer = timer ; 
	
	

	this.everyTime = function( frame ){
		 this.timer --; 
		 if( this.timer <= 0 ){
			removeFrameListener( this , this.everyTime );
			callBack.call( o ); 
		 }  
	}
	 
	addFrameListener( this , this.everyTime );
};
function repeatNTimes( timer , callEvery , o ) { 
	this.o = o; 
	this.callEvery = callEvery; 
	this.timer = timer ; 
	
	

	this.everyTime = function( frame ){
		 this.timer --; 
		 
		 callEvery.call( o , frame ); 
		 
		 if( this.timer <= 0  )
			this.stop();
		 
	}
	
	this.stop = function(){
		removeFrameListener( this , this.everyTime );
	}
	
	addFrameListener( this , this.everyTime );
};
/*
var fondLayer = new Kinetic.Layer();
fondLayer.add( new Kinetic.Rect( {
	width : stage.getWidth(),
	height : stage.getHeight(),
	fill: "#FFFFFF",
    stroke: "black",
    strokeWidth: 4 ,
	x:0,
	y:0
} ) );
stage.add( fondLayer );
fondLayer.draw();
*/
var labelLayer = new Kinetic.Layer();

var labelText = new Kinetic.Text( {
	text: "",
    fontSize: 10,
    fontFamily: "Arial",
    textFill: "black",
    align: "center",
	stroke: "green",
	fill: "#ddd",
    padding: 4,
    strokeWidth: 2,
	x : stage.getWidth()/2,
	y : stage.getHeight()/2 + 43
} ) ;
labelLayer.add( labelText );
stage.add( labelLayer );


this.callBack = {
	changeFocusO : this,
	changeFocusCB : function(){},
	noFocusO : this,
	noFocusCB : function(){}
}


var proc_floor = this;

/*********/
/* class */
/*********/


function Engine() {
	
	this.elementList = [];
	
	// la position du curseur
	this.scroll = 0;
	
	
	
	//l'ecart en y
	this.ecartY = 25;
	
	this.focus = -1;
	
	if( typeof( Engine.prototype.init ) == "undefined" ){
		
		/*  */
		Engine.prototype.extractionDepuisHtml = function ( htmltEl ){
		
			// recuperation des champs
			if( htmltEl.getElementsByTagName( "elements" ).length != 1 )
				throw "la balise elements est introuvable";
			
			var elements = htmltEl.getElementsByTagName( "elements" )[ 0 ];
			
			// classement des elements
			var tab = new Array( elements.children.length );
			for( var i = 0 ; i < tab.length ; i ++ )
				tab[ i ] = {i:i , elo : elements.children[ i ].getAttribute( "elo" ) , img_source : elements.children[ i ].getAttribute( "img_source" ) , label : elements.children[ i ].getAttribute( "label" ) };
			
			
			// on les trie selon leurs elo
			sortShell( tab , function( a , b ){ return a.elo > b.elo ; } );
			
			
			// on les ajoute
			for( var i = 0 ; i < tab.length ; i ++ ){
				
				//alert( tab[i].label+"  "+tab[i].elo+"  "+tab[i].img_source);
				
				var element = new Element( i , this , tab[i].label , tab[i].elo );
				
				//element.image.onload = function() { element.buildImage(); }
					
				element.image.src = tab[i].img_source;
				
				this.elementList.push( element );
			}
			
			function sortShell( tab , fonction_compare ){
			
				var trie = false;
				var pas = Math.floor( tab.length /3 )+1;
				
				//var pas = 1;
				
				while( !trie ||  pas != 1 ){
					trie = true;
					for(var i = 0 ; i < tab.length -pas ; i ++ ){
						if( fonction_compare( tab[ i ] , tab[ i+pas ] ) ){
							
							swap( i , i +pas );
							
							trie = false;
						
						}
					}
					
					pas = Math.floor( pas /3 ) +1;
				}
				function swap( i , j ){
					
					var tmp = tab[ i ];
					tab[ i ] = tab[ j ];
					tab[ j ] = tmp;
				}
			}
			
		}
		
		/* scroll */
		Engine.prototype.updateImg = function(){
			try{
			var floor = stage.getHeight()/2 + 70;
			
			for( var i = 0 ; i < this.elementList.length ; i ++ ){
				
				if( i == Math.round( this.scroll )  ){
					
					if( Math.abs( ( this.scroll % 1)-0.5 ) > 0.45 ){
						if( this.focus != i )
							this.changeFocus( i );
					}else{
						if( this.focus != -1 )
							this.noFocus( );
					}
					
					
					var dis = Math.max( 1 - Math.abs( i - this.scroll ) , 0.3 );
					
					this.elementList[ i ].y = floor - ( i - this.scroll )  * this.ecartY - ( 0.5+ i - this.scroll ) * 200;
					
					this.elementList[ i ].incl.val = 1 - dis ;
					
					this.elementList[ i ].scale = 0.7+dis ;
					
				} else {
				
					this.elementList[ i ].y = floor - ( i - this.scroll )  * this.ecartY ;
					
					if( i > this.scroll +0.5 )
						this.elementList[ i ].y -= 	200;
						
					
					this.elementList[ i ].incl.val = 0.7 ;
					this.elementList[ i ].scale = 1 ;
				}
				
				this.elementList[ i ].update();
				
			}
			}catch(e){
				throw "update image fail "+e
			}
		}
		
		
		Engine.prototype.attachEvent = function (){
			
			var self = this;
			
			this.draged = false;
			
			this.mousePrevFrame = 0;
			
			// true positif
			this.sens;
			
			this.toStop =null;
			
			this.start_listen_drag = function(){
				if( !this.draged ){
				
					this.draged = true;
					
					self.mousePrevFrame = stage.getMousePosition().y;
					
					if( this.toStop != null )
						this.toStop.stop();
				}
			}
			this.stop_listen_drag = function(){
				
				if( this.draged ){
					this.draged = false;
					/*
					var lin = Math.abs( Math.round( self.scroll ) - self.scroll )/20;
					
					this.toStop = new repeatNTimes( 20 , function( ){
							
							if( Math.round( self.scroll ) > self.scroll )
							
								//self.scroll += ( Math.round( self.scroll ) - self.scroll ) / 20;
								self.scroll += lin;
							else
								
								//self.scroll -= ( Math.round( self.scroll ) + self.scroll ) / 20;
								self.scroll -= lin;
							
							self.scroll = Math.min( self.elementList.length -1 ,  Math.max( 0 , self.scroll ) );
							
							self.updateImg();
							
							
						},
						this 
						);
					*/
					
					
					// si la variation est trop petite, on revient vers le point d'�quilibre
					if(  Math.abs(    ((self.sens)?( Math.floor( self.scroll ) ):( Math.ceil(self.scroll) ) )  -  self.scroll ) > 0.75 )
						self.sens = !self.sens;
					
					var lin =  ( ((self.sens)?( Math.floor( self.scroll ) ):( Math.ceil(self.scroll) ) )  - self.scroll )/20;
					
					
					
					this.toStop = new repeatNTimes( 20 , function( ){
							
							
							self.scroll += lin;
							
							self.scroll = Math.min( self.elementList.length -1 ,  Math.max( 0 , self.scroll ) );
							
							self.updateImg();
							
							
						},
						this 
						);
				}
			}
			this.listen_drag = function(){
				
				if( this.draged ){
					
					
					
					self.scroll -= ( self.mousePrevFrame - stage.getMousePosition().y )/self.ecartY ;
					
					//controle
					self.scroll = Math.min( self.elementList.length -1 ,  Math.max( 0 , self.scroll ) );
					
					self.sens = self.mousePrevFrame > stage.getMousePosition().y;
					
					self.mousePrevFrame = stage.getMousePosition().y;
					
					self.updateImg();
					
				}
			}
			
			
			stage.getDOM().onmousemove = this.listen_drag;
			stage.getDOM().onmousedown = this.start_listen_drag;
			stage.getDOM().onmouseup = 	this.stop_listen_drag;
			stage.getDOM().onmouseout = this.stop_listen_drag;
			
			/*
			stage.on("mousemove", this.listen_drag ); 
				
			stage.on("mouseup mouseout", this.stop_listen_drag ); 
			
			stage.on("mousedown", this.start_listen_drag ); 
			*/
			
			
			
			this.goToFrame = function( i ){
				if( this.toStop != null )
					this.toStop.stop();
					
				var lin =  ( i - self.scroll )/10;
				/*
				var lin = 0.1;
				
				var t = Math.floor( ( i - self.scroll )/lin );
				
				lin = ( i - self.scroll ) / t;
				*/
				this.toStop = new repeatNTimes( 10 , 
					function( ){
		
					self.scroll += lin;
							
					self.scroll = Math.min( self.elementList.length -1 ,  Math.max( 0 , self.scroll ) );
							
					self.updateImg();
							
					
					},
					this 
				);
			}
			
			stage.getDOM().addEventListener( "mousewheel", function( e ){
					
					var dec = ( (e.wheelDelta>0)?( 1 ):( -1 ) )
					
					self.goToFrame( Math.round( self.scroll ) + dec );
					
					// desactive le scroll de la page
					e.preventDefault();
					
				}, false);
			
			
		}
		
		Engine.prototype.goToFrame = function ( i ){
			this.attachEvent.goToFrame( i );
		}
		
		// est appel�e quand le focus( l'image au centre ) change pour du vide
		Engine.prototype.noFocus = function (  ){
			
			this.focus = -1;
			
			labelLayer.hide();
			labelLayer.draw();
			
			proc_floor.callBack.noFocusCB.call( proc_floor.callBack.noFocusO  );
			
		}
		
		// est appel�e quand le focus( l'image au centre ) change 
		Engine.prototype.changeFocus = function ( i ){
			
			
			this.focus = i;
			labelText.setText( this.elementList[ i ].label );
			labelLayer.show();
			labelLayer.draw();
			
			proc_floor.callBack.changeFocusCB.call( proc_floor.callBack.changeFocusO , i , this.elementList[ i ].label  );
			
		}
		
		Engine.prototype.init = true;
	}
	
	this.attachEvent();
	
	//this.extractionDepuisHtml( element_srcHTML );
	
	//this.scroll = this.elementList.length-1;
	//this.updateImg();
}
	

function Element( i , engine , label , elo) {
	
	/* objet graphique */
	this.skew ;
	this.image = new Image();
	this.shape;
	this.layer;
	this.texte;
	
	
	/* objet algorithme */
	this.i = i;
	this.label = label;
	this.elo = elo;
	
	this.incl = { val: 0.75 };
	this.y = 0;
	this.scale = 1;
	// si on acliquer sur le noeud derni�rement
	this.focus = false;
	
	
	if( typeof( Element.init ) == "undefined" ){
		
		
		Element.prototype.dim = { x: 100 , y : 100 };
		
		Element.prototype.build = function(){
			
			var warp = {
				width : this.dim.x,
				height : this.dim.y,
				incl : this.incl
			};
			
			this.skew = new Kinetic.Shape( {
				drawFunc: function(){
					
					var context = this.getContext();
					
						// shear matrix:
						//  1  sx  0              
						//  sy  1  0
						//  0  0  1	
					 
					var sx = 0.75; // .75 horizontal shear
					var sy = 0; // no vertical shear
						
						// apply custom transform
					context.transform(1, 0 , warp.incl.val , 1-0.5*warp.incl.val , 0, 0);
						
					context.fillStyle = "black";
					context.fillRect( -warp.width/2 , - warp.height/2 , warp.width , warp.height );
					
				},
				x : stage.getWidth()/2,
				y : 0
				
				
				}	);
			
			
			
			this.layer = new Kinetic.Layer();
			
			this.layer.add( this.skew );
			stage.add( this.layer );
			
			this.update();
			
		}
		
		Element.prototype.buildImage = function(){
			
			this.layer.remove( this.skew );
			
			var warp = {
				width : this.dim.x,
				height : this.dim.y,
				img : this.image,
				incl : this.incl
			};
			
			this.skew = new Kinetic.Shape( {
				drawFunc: function(){
					var context = this.getContext();
					
						// shear matrix:
						//  1  sx  0              
						//  sy  1  0
						//  0  0  1	
					 
					var sx = 0.75; // .75 horizontal shear
					var sy = 0; // no vertical shear
						
						// apply custom transform
					context.transform(1, 0 , warp.incl.val , 1-0.5*warp.incl.val , 0, 0);
						/*
					context.fillStyle = "black";
					context.fillRect( -warp.width/2 , - warp.height/2 , warp.width , warp.height );
					*/
					context.drawImage( warp.img , -warp.width/2 ,- warp.height/2 , warp.width , warp.height );
					
				},
				x : stage.getWidth()/2,
				y : 0
				
				}	);
			
			this.layer.add( this.skew );
			
			this.update();
			
			//event
			var i = this.i;
			//this.skew.on( "dbltap" , function(){ proc_floor.goToFrame( i ) } );
		}
		
		Element.prototype.update = function(){
		
			this.skew.setY( this.y );
			
			this.skew.setScale( this.scale , this.scale );
			
			this.layer.draw();
		}
		
		Element.init = true;
	}
	
	// on construit le fond et les events
	this.build();
	
	// on construit l'image
	var self = this;
	this.image.onload = function() { self.buildImage(); }
	
}



/*
* ecouteur enterFrame
*/
var listener = [];

function addFrameListener( objet , func ){
	listener.push( {objet :objet , func : func } );
}
function removeFrameListener( objet , func ){
	for( var i = 0 ; i < listener.length ; i ++ )
		if( listener[ i ].objet == objet && listener[ i ].func == func ){
			listener.splice( i , 1 );
			i--;
		}
}


/*
* appel
*/


this.engine = new Engine();

labelLayer.moveToTop();
labelLayer.hide();
labelLayer.draw();

// fps limiter
var fps_limite = 60;
var timer_fps_limiter = 0;

var timerFpsDiff =0;
var timerFps=0;
var averageFps =0;

stage.onFrame(function(frame){
	try{
		// limiteur de fps
		timerFpsDiff += Math.min( frame.timeDiff , 1000/fps_limite ); // on fait un min parceque quand on lache le focus, on a pas de frame, le tieDiff devient enorme quand on revient
		timer_fps_limiter += Math.min( frame.timeDiff , 1000/fps_limite ); 
		if( timer_fps_limiter < 1000/fps_limite )
			return;
		
		timer_fps_limiter -= 1000/fps_limite;
		
		// fps counter
		if( frame.timeDiff > 0 ) averageFps = ( timerFps * averageFps + ( 1/timerFpsDiff *1000) ) / ( timerFps +1 );
		if( timerFps >= 15 ){
			//document.getElementById( "fps_counter_id" ).innerHTML = Math.round( averageFps ) +" fps "  ;
			timerFps = 0;
		}
		timerFpsDiff = 0;
		timerFps ++;
		
		
		
		
		
		for( var i in listener )
			listener[ i ].func.call( listener[ i ].objet , frame );
	
		
		
	}catch( e ){

		catchError( e );
	}
});
stage.start();


// fonction public

this.getFrame = function(){
	return Math.round( this.engine.scroll );
}
this.goToFrame = function( i ){
	this.engine.goToFrame(  i );
}
this.goToLabel = function( lbl ){
	for( var i = 0; i < this.engine.elementList.length ; i ++ )
            if( this.engine.elementList[ i ].label == lbl )
                this.engine.goToFrame(  this.engine.elementList[ i ].i );
}
this.recharge = function(  ){

	for( var i = 0; i < this.engine.elementList.length ; i ++ )
		stage.remove( this.engine.elementList[ i ].layer );

	this.engine.elementList = [];
	
	this.engine.extractionDepuisHtml( document.getElementById( element_srcHTML ) );
	
	labelLayer.moveToTop();
	labelLayer.hide();
	labelLayer.draw();
}

}

}catch( e ){

	catchError( e );
}

