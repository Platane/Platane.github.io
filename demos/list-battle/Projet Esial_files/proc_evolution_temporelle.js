
var catchError= function( e )  {alert( e )}; 

try{


// au cas ou
if( typeof( printOut ) == "undefined" ) var printOut = function(){};
if( typeof( clearOut ) == "undefined" ) var clearOut = function(){};



function procedure_evolution_temporelle ( stage , element_srcHTML  ){


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

var fondLayer = new Kinetic.Layer();
stage.add( fondLayer );

var color_palette = {
    arc_simple : "#999999",
    arc_inferieur : "#d48913",
    arc_superieur : "#458BA9",
    arc_simple2 : "#AAAAAA"
}

var proc_floor = this;

/*********/
/* class */
/*********/


function Engine() {
	
	this.elementList = [];
	
	this.window = {xa : new Date(  ) , xb : new Date( "2012-09-14"  ) , ya : -1 , yb : -1};
	
        this.toStop = null;
        
	if( typeof( Engine.prototype.init ) == "undefined" ){
		
		/*  */
		
		Engine.prototype.extractionDepuisHtml = function ( htmltEl ){
		
			// recuperation des champs
			if( htmltEl.getElementsByTagName( "elements" ).length != 1 )
				throw "la balise elements est introuvable";
			
			var elements = htmltEl.getElementsByTagName( "elements" )[ 0 ];
			   
                        var window = this.window;
                        
			// classement des elements
			var tab = new Array( elements.children.length );
			for( var i = 0 ; i < tab.length ; i ++ )
				tab[ i ] = {i:i , elo : elements.children[ i ].getAttribute( "elo" ) , graphe : decodeDateTab( elements.children[ i ] ) ,  img_source : elements.children[ i ].getAttribute( "img_source" ) , label : elements.children[ i ].getAttribute( "label" )};
			
                        
                        
                        // on ajuste la fenetre
                        this.window.yb = ( Math.ceil( this.window.yb  / 50 )  )* 50;
                        this.window.ya = ( Math.floor( this.window.ya / 50 )  )* 50;
                        
                        
                        // on dessine des trucs sur le fond
                        this.dessineFond();
                        
			// on les trie selon leurs elo
			sortShell( tab , function( a , b ){return a.elo > b.elo ;} );
			
			
			// on les ajoute
			for( var i = 0 ; i < tab.length ; i ++ ){
				
                               
                                if( tab[i].graphe.length>0)
                                    tab[ i ].graphe.push( {elo : tab[ i ].graphe[ tab[i].graphe.length -1  ].elo , date : this.window.xb} );
                                
				for( var j = 0 ; j < tab[i].graphe.length ; j ++ ){
					tab[ i ].graphe[ j ].x = ( tab[ i ].graphe[ j ].date.getTime() - this.window.xa.getTime() ) / ( this.window.xb.getTime() - this.window.xa.getTime() );
					tab[ i ].graphe[ j ].y = 1-( tab[ i ].graphe[ j ].elo - this.window.ya ) / ( this.window.yb - this.window.ya );
                                      
                                      //alert( tab[ i ].graphe[ j ].date+"  \n"+this.window.xa+"\n"+tab[ i ].graphe[ j ].x );
				}
				
				var element = new Element( i , this , tab[i].label , tab[i].elo , tab[i].graphe );
					
				element.image.src = tab[i].img_source;
				
				this.elementList.push( element );
			}
                        
                        
			function decodeDateTab( el ){
                            
                            var tab = new Array( el.children.length );
                            
                            for( var i = 0 ; i < tab.length ; i ++ ){
                                tab[ tab.length - 1 - i ] = {date : decodeDate( el.children[ i ].getAttribute("date") ) , elo : el.children[ i ].getAttribute("elo")};
							
                                                        
                                                       
								// on en profite pour definir la fenetre
								if( window.xa == -1 || window.xa.getTime() > tab[  tab.length - 1 - i  ].date.getTime() )
									window.xa = tab[  tab.length - 1 - i  ].date;
								
								if( window.xb == -1 || window.xb.getTime() < tab[  tab.length - 1 - i  ].date.getTime() )
									window.xb = tab[  tab.length - 1 - i  ].date;
                                                                  
                                                                  
                                                                if( window.ya == -1 || window.ya > tab[ tab.length - 1 - i  ].elo )
									window.ya = tab[  tab.length - 1 - i  ].elo;
                                                                 
                                                                if( window.yb == -1 || window.yb < tab[ tab.length - 1 - i  ].elo )
									window.yb = tab[  tab.length - 1 - i  ].elo;
                            }
                            return tab;
                            
                            function decodeDate( date ){
                                
                                return new Date( 
                                    date.substring( 0 , 4 ) ,       // année
                                    date.substring( 5 , 7 )-1 ,      // month
                                    date.substring( 8 , 10 ),        // jour
                                    date.substring( 11 , 13 ),      // heure
                                    date.substring( 14 , 16 ),      // min
                                    date.substring( 17 , 19 )       // sec
                                );
                            }
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
		
                Engine.prototype.dessineFond = function ( ){
                    
                    var window = this.window;
                    
                    var semaine = [
                        "dim",
                        "lun",
                        "mar",
                        "mer",
                        "jeu",
                        "ven",
                        "sam"
                    ];
                    
                    fondLayer.add( new Kinetic.Shape( {
                        drawFunc : function() {
                            var context = this.getContext();
                            
                            context.font = "10pt Calibri";
                            context.lineCap = "round";
                            
                            for( var i = window.ya + 50  ; i <= window.yb - 50 ; i+= 50  ){
                                if( i == 1500 ){
                                   context.fillStyle = color_palette.arc_superieur;
                                   context.strokeStyle = color_palette.arc_superieur;
                                   context.lineWidth = 3;
                                } else {
                                    context.fillStyle = color_palette.arc_simple2;
                                    context.strokeStyle = color_palette.arc_simple2;
                                    context.lineWidth = 0.3;
                                }
                                
                                context.beginPath();
                                context.moveTo( 50 , ( 1 - ( i - window.ya )/( window.yb - window.ya ) ) * stage.getHeight() );
                                context.lineTo( stage.getWidth() - 50 , ( 1 - ( i - window.ya )/( window.yb - window.ya ) ) * stage.getHeight() );
                                
                                context.stroke();
                                
                                context.fillText( i+"" , 0 , 5 + ( 1 - ( i - window.ya )/( window.yb - window.ya ) ) * stage.getHeight() );
                                
                            }
                            
                            var deb = new Date( window.xa.getFullYear() , window.xa.getMonth() , window.xa.getDate() ,0 , 0 , 0 );
                            
                            context.fillStyle = color_palette.arc_simple2;
                            context.strokeStyle = color_palette.arc_simple2;
                            context.lineWidth = 2;
       
       
                            for( var i = deb.getTime()  ; i <= window.xb.getTime() ; i+= 1000*60*60*24  ){
                                
                                if( i < window.xa.getTime() )
                                   continue;
                                
                                var d = new Date( i );
                                
                                context.fillText( 
                                    (( (""+d.getDate()).length==1)?("0"+d.getDate()):(d.getDate()))+"/"+(( (""+d.getMonth()).length==1)?("0"+d.getMonth()):(d.getMonth())) ,
                                    40+ ( stage.getWidth() - 30 - 30 )*( i - window.xa.getTime() )/( window.xb.getTime() - window.xa.getTime() ) , 
                                    stage.getHeight() - 5 
                                );
                                context.fillText( 
                                    semaine[ d.getDay() ] ,
                                    40+ ( stage.getWidth() - 30 - 30 )*( i - window.xa.getTime() )/( window.xb.getTime() - window.xa.getTime() ) , 
                                    stage.getHeight() - 15 
                                );
                                
                                context.beginPath();
                                context.moveTo( 30+ ( stage.getWidth() - 30 - 30 )*( i - window.xa.getTime() )/( window.xb.getTime() - window.xa.getTime() ) ,  stage.getHeight() -5  );
                                context.lineTo( 30+ ( stage.getWidth() - 30 - 30 )*( i - window.xa.getTime() )/( window.xb.getTime() - window.xa.getTime() ) ,  stage.getHeight() -50 );
                                context.stroke();
                                
                            }
                        }
                    }));
                
                    fondLayer.draw();
                }
                
                Engine.prototype.focus = function( k ){
                    for( var i  = 0 ; i < this.elementList.length ; i ++ )
                        this.elementList[ i ].goBot();
                    
                    this.elementList[ k ].goTop();
                }
                
                Engine.prototype.drawCourbe = function(){
                    
                    
                    if( this.toStop!= null )
                         this.toStop.stop();
                    
                    var el = this.elementList;
                    var lin = 1/120;
                    this.toStop = new repeatNTimes( 125 , function( ){
                         for( var i  = 0 ; i < el.length ; i ++ ){
                             
                             el[ i ].changeUntil( el[ i ].until.val + lin );
                             
                         }
                    } );
                    
                    for( var i  = 0 ; i < el.length ; i ++ )
                            el[ i ].changeUntil( 0 );
                }
                
		Engine.prototype.init = true;
	}
	
}
	

function Element( i , engine , label , elo , graphe ) {
	
	/* objet graphique */
	this.image = new Image();
	this.shape;
	this.layer;
	this.texte;
	this.courbe;
	
        
	/* objet algorithme */
	this.i = i;
	this.label = label;
	this.elo = elo;
	this.graphe = graphe;
        this.until = {val : 0.5};
	
	
	if( typeof( Element.init ) == "undefined" ){
		
		
		Element.prototype.dim = {x: 30 , y : 30};
		
		Element.prototype.buildImage = function(){
			
			this.shape = new Kinetic.Image( { 
				image : this.image,
				width  : this.dim.x,
				height : this.dim.y,
				x : -this.dim.x/2,
				y : -this.dim.y/2
			} );
			
			this.group.add( this.shape );
			
			this.layer.draw();
			
		}
		
		Element.prototype.build = function(){
			
			var fond = new Kinetic.Rect( { 
				width  : this.dim.x,
				height : this.dim.y,
				x : -this.dim.x/2,
				y : -this.dim.y/2,
				fill: "grey",
                                stroke: "black",
                                strokeWidth: 4
			} );
			
			var warp = {
					until : this.until ,
					graphe : this.graphe ,
                                        w : stage.getWidth() - this.dim.x -30,
                                        color : this.color
			}
			
			this.courbe = new Kinetic.Shape( { 
				drawFunc : function(){
					
                                        var context = this.getContext();
                                        
                                        
                                        
                                        if( warp.graphe.length > 0 && warp.graphe[ 0 ].x < warp.until.val ){
                                            context.beginPath();
                                            context.moveTo( 
                                                        warp.graphe[ 0 ].x * warp.w +30, 
                                                        warp.graphe[ 0 ].y * stage.getHeight() 
                                                    );

                                            for( var i = 1; i < warp.graphe.length && warp.graphe[ i ].x < warp.until.val ; i ++ )
                                                context.lineTo( 
                                                        warp.graphe[ i ].x * warp.w +30, 
                                                        warp.graphe[ i ].y * stage.getHeight()  
                                                    );
                                                        
                                            if( i < warp.graphe.length && i > 0 )  
                                                context.lineTo( 
                                                        warp.until.val    * warp.w +30, 
                                                        ( ( warp.until.val - warp.graphe[ i-1 ].x ) /  ( warp.graphe[ i ].x - warp.graphe[ i-1 ].x ) * ( warp.graphe[ i ].y - warp.graphe[ i-1 ].y ) + warp.graphe[ i-1 ].y ) * stage.getHeight()  
                                                    );
                                            
                                            
                                            /*
                                            context.lineWidth = this.getStrokeWidth();
                                            context.setFill();
                                            context.stroke();
                                            */
                                            context.lineCap = "round";
                                            this.fillStroke();
                                            
                                            for( var i = 0; i < warp.graphe.length && warp.graphe[ i ].x < warp.until.val ; i ++ ){
                                                context.beginPath();
                                                context.arc(
                                                        warp.graphe[ i ].x * warp.w +30, 
                                                        warp.graphe[ i ].y * stage.getHeight() ,
                                                        1 ,
                                                        0 ,
                                                        Math.PI * 2,
                                                        false
                                                    );
                                                this.fillStroke();
                                            }
                                            
                                        }
                                        
					
				},
                                stroke: color_palette.arc_simple,
                                strokeWidth: 2
                               
				
			} );
			
			this.group = new Kinetic.Group();
			this.group.add( fond );
                        
			
			this.layer = new Kinetic.Layer();
                        this.layer.add( this.courbe );
                        this.layer.add( this.group );
                        
			stage.add( this.layer );
                        
                        this.layer.draw();
			
                    
		}
		
                Element.prototype.goTop = function(  ){
                    
                    if( typeof( this.courbe ) != "undefined" ){
                        this.courbe.setStroke( color_palette.arc_inferieur );
                        this.courbe.setStrokeWidth( 5 );

                        this.layer.draw();
                    }
                }
                Element.prototype.goBot = function(  ){
                    
                    if( typeof( this.courbe ) != "undefined" ){
                        this.courbe.setStroke( color_palette.arc_simple );
                        this.courbe.setStrokeWidth( 2 );
                        this.layer.draw();
                    }
                }
                
                Element.prototype.changeUntil = function( x ){
                    this.until.val = Math.max( 0 , Math.min( 1 , x ) );
                    
                    
                    if( this.graphe.length > 0 && this.graphe[ 0 ].x < x ){
                        
                        
                        for( var i = 1; i < this.graphe.length && this.graphe[ i ].x < x ; i ++ ) ;
                            
                            
                        if( i < this.graphe.length && i > 0 )  
                            this.group.setPosition( 
                                 x  * ( stage.getWidth() - this.dim.x -30 ) +30,
                               (  this.graphe[ i-1 ].y + ( x - this.graphe[ i-1 ].x ) /  ( this.graphe[ i ].x - this.graphe[ i-1 ].x ) * ( this.graphe[ i ].y - this.graphe[ i-1 ].y ) ) * stage.getHeight() 
                               
                        );
                        if( i == this.graphe.length && i > 0 ) 
                            this.group.setPosition( 
                                 x  * ( stage.getWidth() - this.dim.x -30 ) +30,
                                 this.graphe[ i-1 ].y * stage.getHeight() 
                               
                        );
                       this.group.show();
                    } else {
                       this.group.hide();
                    }
                    
                    this.layer.draw();
                }
                
		Element.init = true;
	}
	
	// on construit le fond et les events
	this.build();
	
	// on construit l'image
	var self = this;
	this.image.onload = function() {self.buildImage();}
	
}



/*
* ecouteur enterFrame
*/
var listener = [];

function addFrameListener( objet , func ){
	listener.push( {objet :objet , func : func} );
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
                this.engine.focus(  this.engine.elementList[ i ].i );
        
        this.engine.drawCourbe();
}
this.recharge = function(  ){
        
	for( var i = 0; i < this.engine.elementList.length ; i ++ )
		stage.remove( this.engine.elementList[ i ].layer );

	this.engine.elementList = [];
	
	this.engine.extractionDepuisHtml( document.getElementById( element_srcHTML ) );
	
        this.engine.drawCourbe();
}

}


}catch( e ){

	catchError( e );
}

