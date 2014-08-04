
var catchError= function( e )  { alert( e ) }; 


try{


// au cas ou
if( typeof( printOut ) == "undefined" ) var printOut = function(){};
if( typeof( clearOut ) == "undefined" ) var clearOut = function(){};



function procedure_graphe ( stage  ){


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


var arcLayer = new Kinetic.Layer();
var arcUpLayer = new Kinetic.Layer();


var color_palette = {
    arc_simple : "#999999",
    arc_inferieur : "#d48913",
    arc_superieur : "#458BA9",
    arc_simple2 : "#AAAAAA"
}

var fondLayer = new Kinetic.Layer();
fondLayer.add( new Kinetic.Shape( {
                        drawFunc : function() {
                            var context = this.getContext();
                            
                            context.font = "10pt Calibri";
                            context.lineCap = "round";
                             context.strokeStyle = "#AAAAAA";
                            context.lineWidth = 0.5;
                            
                            
                            var ligne = 15;
                            for( var i = 0  ; i <= ligne ; i ++  ){
                                
                                
                                var l = Math.pow( 1-Math.abs( ( ligne - i*2 )/ligne ) , 2 ) * 0.6 + 0.01;
                                
                                context.beginPath();
                                context.moveTo(  Math.min( stage.getWidth() -2 , Math.max( 2 , ( i / ligne ) * stage.getWidth() ) ) , ( 1 - l ) / 2 * stage.getHeight() );
                                context.lineTo(  Math.min( stage.getWidth() -2 , Math.max( 2 , ( i / ligne ) * stage.getWidth() ) ) , ( ( 1 - l ) / 2 + l ) * stage.getHeight() );
                                context.stroke();
                                
                            } 
                            
                        }
                    } ) );



var retraceOrder = { arcLayer : true , arcUpLayer : true };

var retraceLayer = function(){

	if( retraceOrder.arcLayer ){
		arcLayer.draw();
		retraceOrder.arcLayer = false;
	}
	if( retraceOrder.arcUpLayer ){
		arcUpLayer.draw();
		retraceOrder.arcUpLayer = false;
	}
}


stage.add( fondLayer );
stage.add( arcLayer );
stage.add( arcUpLayer );


//fondLayer.draw();




this.callBack = {
	changeFocusO : this,
	changeFocusCB : function(){}
}

var floor_proc = this;

/*********/
/* class */
/*********/

function Arc( i , j  ,engine ) {
	
	/* objet graphique */
	this.group = new Kinetic.Group();
	this.shape;
	this.arrow;
	this.epaisseur =  engine.graphe.arcBridgeTab[ i ][ j ] * 0.3 +1;
	
	/* objet algorithme */
	this.i = i ;
	this.j = j ;
	this.nodeFocus = false;
	
	var engine = engine;
	
	if( typeof( Arc.init ) == "undefined" ){
		
		Arc.prototype.buildShape = function(){
			
			/* les points x et y */
			this.shape = new Kinetic.Rect( { 
				width  : 0,
				height : this.epaisseur,
				x : 0,
				y : -this.epaisseur/2,
				fill: color_palette.arc_simple,
				strokeWidth: 0.0001
			} );
			this.arrow = new Kinetic.RegularPolygon( { 
				sides: 3,
                radius: this.epaisseur*1.5 + 5,
				x : -15,
				y : 0,
				fill: color_palette.arc_simple,
                strokeWidth: 0.0001
			} );
			
			this.arrow.setRotation( Math.PI/2 );
			
			this.group.add( this.arrow );
			this.group.add( this.shape );
			
			this.group.x = 0;
			this.group.y = 0;
			
			
			arcLayer.add( this.group );
		}
		
		/* passe l'arc a premier plan */
		Arc.prototype.swapToTop = function(){
			
			arcLayer.remove( this.group );
			
			arcUpLayer.add( this.group );
			
			this.group.on("mouseover", function() {
                document.body.style.cursor = "pointer";
            });
            this.group.on("mouseout", function() {
                document.body.style.cursor = "default";
            });
			
			this.shape.setFill( color_palette.arc_superieur );
			this.arrow.setFill( color_palette.arc_superieur );
			
			this.nodeFocus = true;
			
			// on demande de retracer les deux calcques
			retraceOrder.arcLayer = true;
			retraceOrder.arcUpLayer = true;
		}
		
		/* passe l'arc a l'arriere plan */
		Arc.prototype.swapToBot = function(){
			
			arcUpLayer.remove( this.group );
			
			arcLayer.add( this.group );
			
			this.group.off("mouseover");
            this.group.off("mouseout");
			
			this.shape.setFill( color_palette.arc_simple );
			this.arrow.setFill( color_palette.arc_simple );
			
			this.nodeFocus = false;
			
			// on demande de retracer les deux calcques
			retraceOrder.arcLayer = true;
			retraceOrder.arcUpLayer = true;
		}
		
		Arc.prototype.retrace = function(){
			
			/* les points x et y */
			var A = engine.elementList[ this.i ].group.getPosition();
			var B = engine.elementList[ this.j ].group.getPosition();
			
			var distance = OpP.distance( A , B );
			
			this.shape.setWidth( distance );
			
                        this.group.setPosition( A.x , A.y );
                        
                        this.arrow.setPosition( distance/2 ,  this.arrow.getPosition().y );
                        
                        /*
                        this.shape.width = distance;
			
			this.arrow.x = distance/2
                        
			this.group.x = A.x;
			this.group.y = A.y;
                    
			*/
			this.group.setRotation( -Math.atan2( B.x - A.x , B.y - A.y ) + Math.PI/2 );
			
			if( !this.nodeFocus )
				retraceOrder.arcLayer = true;
			else
				retraceOrder.arcUpLayer = true;
                        
		}
		
		Arc.init = true;
	}
	this.buildShape();
	
}


function Engine() {
	
	this.elementList = [];
	
	this.graphe = new Graphe();
	
	this.phyEngine;
	
	// si true, la prochaine image sur laquelle on clique dÃ©clenchera un repatiAround elle meme 
	this.InfoMode = false;
	
	if( typeof( Engine.prototype.init ) == "undefined" ){
		
		/* ajoute un Ã©lÃ©ment avec l'image et le noeud spÃ©cifiÃ© */
		Engine.prototype.addElement = function( sourceImg , i , label ){
			
			var element = new Element( i , this , label );
				
			element.image.onload = function() { element.buildShape(); }
				
			element.image.src = sourceImg;
			
			element.attachArcs( this );
			
			this.elementList.push( element );
		}
		
		/* ajoute tout les Ã©lÃ©ments correspondants aux images */
		Engine.prototype.buildElements = function( sourcesImg ){
			
			for( var i = 0 ; i <  sourceImg.length ; i ++  )
				this.addElement( sourcesImg[ i ] , i );
		}
		
		/* reparti les elements sur un cercle */
		Engine.prototype.repartiElementsCercle = function( ){
			
			var centre = { x: stage.getWidth()/2 , y : stage.getHeight()/2 };
			
			var rayon = Math.min( stage.getWidth() , stage.getHeight() )/2 -100;
			
			for( var i = 0 ; i <  this.elementList.length ; i ++  )
				 
                                 this.elementList[ i ].deplace( 
						Math.sin( i * Math.PI/this.elementList.length *2 ) * rayon + centre.x ,
						-Math.cos( i * Math.PI/this.elementList.length *2 ) * rayon + centre.y 
						);
                         	
			this.retraceArcs();
		}
		
		/* reparti les elements sur une droite verticale */
		Engine.prototype.repartiElementsVertical = function( ){
			
			for( var i = 0 ; i <  this.elementList.length ; i ++  )
				 this.elementList[ i ].deplace( 
						stage.getWidth()/2 ,
						stage.getHeight() * ( 0.8 * ( i/this.elementList.length ) + 0.1 )
						);
						
			this.retraceArcs();
		}
		
		/* repartie les Ã©lÃ©ments autour de l'Ã©lÃ©ment i */
		Engine.prototype.repartiAround = function( i ){
			
			this.elementList[ i ].deplace( 
						stage.getWidth()/2 ,
						stage.getHeight() /2 
						);
			
			
			var count = { right : 0 , bot : 0 , left : 0 };
			
			for( var j = 0 ; j <  this.elementList.length ; j ++  ){
				if( i == j )
					continue;
					
				if( this.graphe.getWeight( i , j ) == 0 )
					count.bot ++;
					
				if( this.graphe.getWeight( i , j ) > 0 )
					count.left ++;
					
				if( this.graphe.getWeight( i , j ) < 0 )
					count.right ++;
			}
			
			var stack = { right : 0 , bot : 0 , left : 0 };
			
			var colomn = Math.floor( stage.getHeight() / ( this.elementList[ 0 ].dim.x * 1.3 )  )- 2;
			
			var ligne = Math.floor( stage.getWidth() / ( this.elementList[ 0 ].dim.x * 1.3 )  )- 4;
			
			for( var j = 0 ; j <  this.elementList.length ; j ++  ){
				if( i == j )
					continue;
					
				if( this.graphe.getWeight( i , j ) == 0 ){
					this.elementList[ j ].deplace( 
						( 3 + ( stack.bot % ligne ) )* this.elementList[ j ].dim.x * 1.3 ,
						stage.getHeight() - ( Math.floor( stack.bot / ligne ) +1 ) * this.elementList[ j ].dim.y * 1.3 
					);
					stack.bot ++;
				} 
				if( this.graphe.getWeight( i , j ) > 0 ){
					this.elementList[ j ].deplace( 
						( Math.floor( stack.left /colomn ) +1 ) * this.elementList[ j ].dim.x * 1.3 ,
						stage.getHeight() * 0.1 + ( stack.left % colomn ) * this.elementList[ j ].dim.y * 1.3
					);
					stack.left ++;
				} 
					
				if( this.graphe.getWeight( i , j ) < 0 ){
					this.elementList[ j ].deplace( 
						stage.getWidth() - ( Math.floor( stack.right /colomn ) +1 ) * this.elementList[ j ].dim.x * 1.3 ,
						stage.getHeight() * 0.1 + ( stack.right % colomn ) * this.elementList[ j ].dim.y * 1.3
					);
					stack.right ++;
				}
			}
			
			this.retraceArcs();
		}
		
		/* on retrace les arcs */
		Engine.prototype.retraceArcs = function( ){
			
			for( var i = 0 ; i <  this.elementList.length ; i ++  )
				this.elementList[ i ].retraceArcs();
				
		}
		
		/* lance le moteur physique */
		Engine.prototype.startPhyEngine = function(){

			this.phyEngine = new PhyEngine();
			this.phyEngine.elementList = this.elementList;
			this.phyEngine.graphe = this.graphe;

			addFrameListener( this.phyEngine, this.phyEngine.cycle );
		}
		
		/* stope le moteur physique */
		Engine.prototype.stopPhyEngine = function(){
			
			if( typeof( this.phyEngine  ) == "undefined" || this.phyEngine == null )
				return
				
			removeFrameListener( this.phyEngine, this.phyEngine.cycle );
			
			this.phyEngine = null;
		}
		
		
		Engine.prototype.init = true;
	}
	
	
}


function Element( i , engine , label ) {
	
	/* objet graphique */
	this.group = new Kinetic.Group( { draggable: true } );
	this.image = new Image();
	this.shape;
	this.layer = new Kinetic.Layer();
	this.texte;
	
	this.label = label;
	
	this.arcList = [];
	
	/* objet algorithme */
	this.i = i;
	
	// les noeuds qui parte de this pour aller vers i
	this.arcNode = [];
	
	// les noeuds qui parte de i pour aller vers this
	this.arcAdjNode = [];
	
	// si on acliquer sur le noeud derniÃ¨rement
	this.focus = false;
	
	// si le composant est en train d'Ãªtre dragger
	this.isdragged = false;
	
	if( typeof( Element.init ) == "undefined" ){
		
		
		Element.prototype.dim = { x: 50 , y : 50 };
		
		Element.prototype.buildShape = function(){
			
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
		
		Element.prototype.build = function(  ){
			this.texte = new Kinetic.Text( {
				x: 0 ,
                                y: this.dim.y / 2 + 10 ,
                                text: this.label,
                                fontSize: 10,
                                fontFamily: "Calibri",
                                textFill: "black",
                                align: "center",
                                verticalAlign: "middle"
			} );
			
			var fond = new Kinetic.Rect( { 
				width  : this.dim.x,
				height : this.dim.y,
				x : -this.dim.x/2,
				y : -this.dim.y/2,
				fill: "grey",
                                stroke: "black",
                                strokeWidth: 4
			} );
			
			this.group.add( fond );
			
			this.layer.add( this.group );
			
			stage.add( this.layer );
			
			var self = this;
			
			this.group.on("dragstart", function() {
               self.isdragged = true;
            });
            this.group.on("dragend", function() {
               self.isdragged = false;
            });
			
			
			this.group.on("mouseover", function() {
				self.group.add( self.texte );
				self.layer.draw();
				document.body.style.cursor = "pointer";
            });
            this.group.on("mouseout", function() {
				self.group.remove( self.texte );
				self.layer.draw();
				document.body.style.cursor = "default";
				self.isdragged = false;
            });
			var f = this;
			this.group.on("dragmove", function() {
				f.onDrag.call( f );
            });
			
			this.group.on("mousedown", function() { 
				f.swapToTop.call( f ); 
				self.isdragged = true;
				
                                floor_proc.callBack.changeFocusCB.call( floor_proc.callBack.changeFocusO , f.i , f.label  );
                                
			} );
			
            this.group.on("dblclick", function() {   engine.repartiAround( self.i ); } );      
                        
                        
			// ne se declenche pas ?
			this.group.on("mouseup", function() { 
				printOut( "<br> up ");
				self.isdragged = false;
			} );
			
			this.layer.draw();
			
		}
		
		Element.prototype.onDrag = function(  ){
			
			// on demande aux noeuds qui arrivent sur nous de redessiner leurs arcs
			for( var i = 0 ; i < this.arcAdjNode.length ; i ++ )
				engine.elementList[ this.arcAdjNode[ i ] ].retraceArcs();
			
			// on redessine nos arcs
			this.retraceArcs();
		}
		
		/* on dÃ©place l'Ã©lÃ©ment Ã  la position indiquÃ©e */
		Element.prototype.deplace = function( x , y ){
			
                        this.group.setPosition( x , y );
                        
			this.layer.draw();
			
			this.retraceArcs();
			
			for( var i = 0 ; i < this.arcNode.lenght ; i ++ )
				this.arcNode[ i ].retraceArcs();
				
		}
		
		/* on demande aux arc de s'actualiser */
		Element.prototype.retraceArcs = function(){
			
			for( var i = 0 ; i < this.arcList.length ; i ++ )
				this.arcList[ i ].retrace();
				
		}
		
		/* ajoute les acrs aux tableau, nÃ©cessite un acces Ã  engine */
		Element.prototype.attachArcs = function( engine ){
			for( var i = 0 ; i < engine.graphe.arcBridgeTab.length ; i ++ )
				if(  engine.graphe.arcBridgeTab[ this.i ][ i ] > 0 ){
					
					this.arcNode.push( i );
					
					var arc = new Arc( this.i , i  , engine );
					
					this.arcList.push( arc );
					
				}else if( engine.graphe.arcBridgeTab[ this.i ][ i ] < 0 ){
					
					this.arcAdjNode.push( i );
				}
		}
		
		/* met tout les arcs au premier plan */
		Element.prototype.swapToTop = function( ){
		
			if( this.focus )
				return;
				
			
			
			// on appel swap to top sur touts les arcs
			for( var i = 0 ; i < this.arcList.length ; i ++ )
				this.arcList[ i ].swapToTop();
			
			// On ajoute les arcs qui arrivent
			for( var i = 0 ; i < this.arcAdjNode.length ; i ++ ){
				
				var arc = new Arc( this.arcAdjNode[ i ] , this.i  , engine );
				
				arc.swapToTop();
				
				arc.retrace();
				
				arc.arrow.setFill( color_palette.arc_inferieur  );
				arc.shape.setFill( color_palette.arc_inferieur  );
				
				this.arcList.push( arc );
			}
			
			// on retire le focus au autre
			for( var i = 0 ; i < engine.elementList.length ; i ++ )
				if( engine.elementList[ i ].focus )
					engine.elementList[ i ].swapToBot();
			
			
			// on demande de retracer les deux calcques
			retraceOrder.arcLayer = true;
			retraceOrder.arcUpLayer = true;
			
			this.focus = true;
		}
		
		/* met tout les arcs au premier plan */
		Element.prototype.swapToBot = function( ){
		
			if( !this.focus )
				return;
			
			// On suppr les arcs qui arrivent
			for( var j = 0 ; j < this.arcList.length ; j ++ )
				if( this.arcList[ j ].i != this.i ){
					
					// on le supprime du layer
					arcUpLayer.remove( this.arcList[ j ].group );
					
					// et de la liste
					this.arcList.splice( j , 1 );
					j --;
				}
			
			// on appel swap to bot sur touts les arcs
			for( var i = 0 ; i < this.arcList.length ; i ++ )
				this.arcList[ i ].swapToBot();
			
			
			// on demande de retracer les deux calcques
			retraceOrder.arcLayer = true;
			retraceOrder.arcUpLayer = true;
			
			this.focus = false;
		}
		
		
		/* encapsulation ... */
		Element.prototype.getPos = function(){
			return this.group.getPosition();
		}
		
		Element.init = true;
	}
	
	this.image.onload =  function() { this.buildShape() ; }
	
	this.build ();
	
}



function PhyElement( element ){

	this.element = element;
	
	this.forceList = [];
	
	this.target = null;
	
	if( typeof( PhyElement.init ) == "undefined" ){
		
		PhyElement.prototype.applyForce = function(){
			
		}
		
		
		
		
	
		PhyElement.prototype.init = true;
	}
}


function PhyEngine() {
	
	this.elementList = [];
	
	this.graphe ;
	
	if( typeof( PhyEngine.prototype.init ) == "undefined" ){
	
		/* 
		* effectue un cycle ,
		* pour tout les elements, fait la liste de toutes les forces qui l'anime et les applique
		*/
		PhyEngine.prototype.cycle = function( frame ){
			
			var max_depl = 0;
			
			var resultanteX = new Array( this.elementList.length );
			
			// ajuste les positions en x,
			// en appiquant les forces de liaison
			
			for( var i = 0 ; i < this.elementList.length ; i ++ ){
				
				var element = this.elementList[ i ];
				
				resultanteX[ i ] = 0;
				
				//force appliquÃ©es par les autres elements
				for( var j = 0 ; j < this.elementList.length ; j ++ ){
					if( i == j ) continue;
					
					resultanteX[ i ] += this.force( i , j );
				}
				
				//force appliquÃ©es par les bords
				var intensiteBord = 500;
				
				//bord droit
				resultanteX[ i ] += intensiteBord / ( this.elementList[i].getPos().x * this.elementList[i].getPos().x );
				
				// absorbe la force si on est trop pres
				if( this.elementList[i].getPos().x < this.elementList[i].dim.x * 3 && resultanteX[ i ] < 0 ){
					//resultanteX[ i ] -= ( 1.1-Math.max( 0 ,  this.elementList[i].getPos().x - this.elementList[i].dim.x ) / ( this.elementList[i].dim.x * 3 ) ) * resultanteX[ i ];
				}
				//bord gauche
				resultanteX[ i ] -= intensiteBord / ( (stage.getWidth() - this.elementList[i].getPos().x ) * ( stage.getWidth() - this.elementList[i].getPos().x ) );
				
				// absorbe la force si on est trop pres
				if( stage.getWidth() - this.elementList[i].getPos().x < this.elementList[i].dim.x * 3 && resultanteX[ i ] > 0 ){
					//resultanteX[ i ] -= ( 1.1-Math.max( 0 ,  ( stage.getWidth() - this.elementList[i].getPos().x ) - this.elementList[i].dim.x ) / ( this.elementList[i].dim.x * 3 ) ) * resultanteX[ i ];
				}
				
				if( resultanteX[ i ] >  max_depl )
					max_depl = resultanteX[ i ];
			}
			
			
			
			// ajuste les positions en y, 
			// en sÃ©parant les elements les un des autres
			
			var resultanteY = new Array( this.elementList.length );
			for( var i = 0 ; i < this.elementList.length ; i ++ ){
				
				var element = this.elementList[ i ];
				
				resultanteY[ i ] = 0;
				
				//force appliquÃ©es par les autres elements
				for( var j = 0 ; j < this.elementList.length ; j ++ ){
					if( i == j ) continue;
					
					var distance = OpP.distance( this.elementList[i].getPos() , this.elementList[j].getPos() );
					
					if( distance < 20 )
						distance = 20;
					
					var f = 10000 / ( distance * distance );
					
					resultanteY[ i ] += f * ( ( this.elementList[ j ].getPos().y < this.elementList[ i ].getPos().y )?( 1 ):( -1 ) );
				}
				
				//force appliquÃ©es par les bords
				
				var intensiteBord = 500 * this.elementList.length;
				
				//bord haut
				resultanteY[ i ] += intensiteBord / ( this.elementList[i].getPos().y * this.elementList[i].getPos().y );
				
				//bord bas
				resultanteY[ i ] -= intensiteBord / ( (stage.getHeight() - this.elementList[i].getPos().y ) * ( stage.getHeight() - this.elementList[i].getPos().y ) );
			
				if( resultanteY[ i ] >  max_depl )
					max_depl = resultanteY[ i ];
			}
			
			//application
			for( var i = 0 ; i < this.elementList.length ; i ++ ){
				
				var element = this.elementList[ i ];
				
				
				
				if( element.isdragged ){
					element.retraceArcs();
					retraceOrder.arcUpLayer = true;
					continue;
				}
				//var coeff = Math.max( frame.timeDiff , 500 ) / ( 10 );
				
				var coeff = 2;
				
				if( max_depl > 5 ) var coeff = 5 / max_depl;
				
				
				var newPos = {
					x: element.getPos().x + resultanteX[ i ] * coeff,
					y: element.getPos().y + resultanteY[ i ] * coeff
				};
				
				element.deplace( newPos.x , newPos.y );
			}
			
		}
		
		
		/* calcul la force qu'exerce j sur i, que recoit i de j */
		PhyEngine.prototype.force = function( i , j ){
			
			var link;
			
			if( ( link = this.graphe.getWeight( i , j ) ) == 0 )
				return 0;
				
			var distance = Math.abs( this.elementList[ i ].getPos().x - this.elementList[ j ].getPos().x );
			
			
			var w = Math.abs( this.graphe.getWeight( i , j ) );
			
			var delta = 0.002 ;
			var A = 0.08 * w;
			
			// si i est devant j , il faut que arc i -> j soit positif pour avoir une repulsion
			if ( this.elementList[ j ].getPos().x - this.elementList[ i ].getPos().x < 0 == this.graphe.getWeight( i , j )  > 0 ) {
				// repulsion
				
				var f = A * Math.exp( - distance * delta * 0.8 );
				
			} else {
				// attraction
				
				var f =  - A * 2 * ( 1 -  Math.exp( -  ( distance * delta  + 0.693147181 ) ) ) ;
			}
			
			return f * ( ( this.elementList[ j ].getPos().x < this.elementList[ i ].getPos().x )?( 1 ):( -1 ) );
		}
		
		PhyEngine.prototype.init = true;
	}
}
	

function Graphe() {
	
	
	this.arcTab = [];
	
	this.arcIndirectTab = [];
	
	this.arcBridgeTab = [];
	
	if( typeof( Graphe.init ) == "undefined" ){
	
		/* renvoit un tableau avec touts les chemins qui vont de A Ã  B */
		Graphe.prototype.getIndirectPath = function( A , B ){
			
			// un A* sans heuristique
			
			var endingPaths = [];
			
			var openList = [];
			var closeList = new Array( this.arcBridgeTab.length );
			
			// on initialise avec le noeud A
			openList.push( { poid : 0 , node : A , parent : null } );
					
			// on boucle tant que l'openList n'est pas vide
			while( openList.length > 0 ){
				
				var n = openList.shift();
				
				// sortie prÃ©maturÃ©e
				if( endingPaths.length > 0 && n.poid < endingPaths[ 0 ].poid )
					continue;
				
				// si c'est la fin,
				// on ajoute Ã  endingPaths
				if( n.node == B )
					endingPaths.push( n );
					
				// on ajoute ses fils
				for( var i = 0 ; i < this.arcBridgeTab.length ; i ++ )
					if( this.arcBridgeTab[ n.node ][ i ]  > 0 ){
						
						if( typeof( closeList[ i ] ) != "undefined" )
							// si l'Ã©lÃ©ment est dÃ©jÃ  dans la closeList
							// on le modifie si le poid est meilleurs par cette voie
							var poid;
							if( ( poid = Math.min( this.arcTab[ n.node ][ i ] , n.poid ) ) > closeList[ i ].poid ){
								closeList[ i ].poid = poid;
								closeList[ i ].profondeur = n.profondeur +1;
								closeList[ i ].parent = node.n;
							}
							
						else 
							// sinon on l'ajoute Ã  l'openList
							openList.push( { 
									poid : Math.min( this.arcTab[ n.node ][ i ] , n.poid ) ,   // le calcul du nouveau poid
									node : i , 
									profondeur : n.profondeur +1 , 
									parent : node.n 
								} );
					}
					
				// on le place dans la closeList
				closeList[ i ] = n;
				
			}
		}
		
		Graphe.prototype.generateIndirectTab = function(){
			
			
			
		}
		
		/* genere le bridgeTab, qui compose les arcs orientÃ©s */
		Graphe.prototype.generateBridgeTab = function(){
			
			
			this.arcBridgeTab = new Array( this.arcTab.length ) ;
			
			for( var i = 0 ; i < this.arcTab.length ; i ++ ){
				
				this.arcBridgeTab[ i ] = new Array( this.arcTab.length );
				
				for( var j = 0 ; j < this.arcTab.length ; j ++ ){
					
					this.arcBridgeTab[ i ][ j ] = Math.round( this.arcTab[ j ][ i ] - this.arcTab[ i ][ j ] );
					
					if( Math.abs( this.arcBridgeTab[ i ][ j ] ) < 1 )
						this.arcBridgeTab[ i ][ j ] = 0;
				}
			}
		}
		
		/* renvoit un tableau des noeuds accessible depuis A directement */
		Graphe.prototype.getDirectNode = function( A ){
			
			var tab = [];
			for( var i = 0 ; i < this.arcTab.length ; i ++ )
				if( this.arcTab[ A ][ i ] != 0 )
					tab.push( i );
			
			return tab;
			
		}
		
		Graphe.prototype.generateRandomGraphe = function( n ){
			
			this.arcTab = new Array( n ) ;
			
			for( var i = 0 ; i < n ; i ++ ){
			
				this.arcTab[ i ] = new Array( n ) ;
				
				for( var j = 0 ; j < n ; j ++ )
					if( Math.random() > 0.4 )
						this.arcTab[ i ][ j ] =  Math.floor( Math.random() * 20 ) ;
					else
						this.arcTab[ i ][ j ] =  0 ;
			}
		}
		
		/* le plus simple */
		Graphe.prototype.getWeight = function( i , j ){
			if( typeof( this.arcBridgeTab[ i ][ j ] ) == "undefined" || this.arcBridgeTab[ i ][ j ] == null  ) return 0;
			
			return this.arcBridgeTab[ i ][ j ];
		}
		
		Graphe.init = true;
	}
	
}



function ExtractionDepuisHtml( htmltEl , field ){
	
	// declaration de l'Engine
	if( typeof( field.Engine ) == "undefined" || field.Engine == null )
		field.engine = new Engine();
		
		
	// recuperation des champs
	if( htmltEl.getElementsByTagName( "elements" ).length != 1 )
		throw "la balise elements est introuvable";
	
	var elements = htmltEl.getElementsByTagName( "elements" )[ 0 ];
		
	if( htmltEl.getElementsByTagName( "graphe" ).length != 1 )
		throw "la balise graphe est introuvable";
	
	var graphe = htmltEl.getElementsByTagName( "graphe" )[ 0 ];
	
	//chargement du graphe
	
	field.engine.graphe.generateRandomGraphe( elements.children.length );
	
	field.engine.graphe.arcTab = decodeGraphe( graphe.innerHTML );
	
	field.engine.graphe.generateBridgeTab();
	
	//chargement des elements
	for( var i = 0 ; i < elements.children.length ; i ++ )
		field.engine.addElement( elements.children[ i ].getAttribute( "img_source" ) , i , elements.children[ i ].getAttribute( "label" ) );
	
	// redessine
	field.engine.repartiElementsCercle();
	
	field.engine.retraceArcs();
	    
	function decodeGraphe( chaine ){
		
		/*
		* un graphe est codÃ© comme suit <entier> est nombre entier
		* <nombre element> | < 1 1 > | < 1 2 > | < 1 3 > | .... | < 2 1 > | < 2 2 > | .... 
		*/
		
		var pointeur = 0;
		
		var n = readNextNumber( );
		
		var tab = new Array( n );
		
		for( var i = 0 ; i < n ; i ++ ){
			
			tab[ i ] = new Array( n );
			
			for( var j = 0 ; j < n ; j ++ )
				tab[ i ][ j ] = readNextNumber( );
		}
		
		return tab;
		
		function readNextNumber( ){
			
			var tmp = "";
			
			
			var c;
			while( pointeur < chaine.length && ( c = chaine.charAt( pointeur ) ) != "|" ){
				tmp += c;
				pointeur ++;
			}
			
			pointeur ++;
			
			return parseFloat( tmp );
		}
	}
	
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

this.engine = null;

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
	
		retraceLayer();
		
	}catch( e ){

		catchError( e );
	}
});
stage.start();


/*
* fonction utilisateur
*/



var engine = this.engine;
this.user = {
	phy : false,
	switch_phy : function(){
		
		this.phy = !this.phy;
		
		if( this.phy )
			floor_proc.engine.startPhyEngine();
		else
			floor_proc.engine.stopPhyEngine();
		
	},
	cicle : function(){
		
		floor_proc.engine.repartiElementsCercle();
		
	},
	switchInfoMode : function(){
		
		floor_proc.engine.InfoMode = true;
		
	},
	switch_hide_arc : function(){
	
	},

	recharge : function(){
		
		if( typeof( floor_proc.engine ) != "undefined" &&  floor_proc.engine != null && typeof( floor_proc.engine.elementList ) != "undefined" ) 	
			for( var i =  0; i < floor_proc.engine.elementList.length  ; i ++ )
				stage.remove( floor_proc.engine.elementList[ i ].layer );
		
		floor_proc.engine = null;
		
                arcLayer.removeChildren();
                arcUpLayer.removeChildren();
                
                arcLayer.draw();
                arcUpLayer.draw();
                
		ExtractionDepuisHtml( document.getElementById( "source_element" ) , floor_proc );
	}	
}


}





}catch( e ){
	alert( e );
	catchError( e );
}

