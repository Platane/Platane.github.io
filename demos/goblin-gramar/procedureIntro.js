
try{


// au cas ou
if( typeof( printOut ) == "undefined" ) var printOut = function(){};
if( typeof( clearOut ) == "undefined" ) var clearOut = function(){};


var catchError= function( e )  { alert( e ) }; 



function procedureIntro( stage ){

stage = stage;

//gestion de la trame de temps //

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
function repeatNTimes( timer , callEvery , o ) { 
	this.o = o; 
	this.callEvery = callEvery; 
	this.timer = timer ; 
	
	

	this.everyTime = function( frame ){
		 this.timer --; 
		 
		 callEvery.call( o , frame ); 
		 
		 if( this.timer <= 0 ){
			removeFrameListener( this , this.everyTime );
		 }  
	}
	 
	addFrameListener( this , this.everyTime );
};

// gestion des retraces

var fondLayer = new Kinetic.Layer();
var animLayer = new Kinetic.Layer();
var texteLayer = new Kinetic.Layer();
var boutonLayer = new Kinetic.Layer();

var retraceOrder = { 
	fond :  { layer : fondLayer  , ordre : true } ,
	anim :  { layer : animLayer  , ordre : true } ,
	texte : { layer : texteLayer , ordre : true } ,
	bouton :{ layer : boutonLayer, ordre : true } 
};

for( var i in retraceOrder )
	stage.add( retraceOrder[ i ].layer );

var retraceLayer = function(){

	for( var i in retraceOrder )
		if( retraceOrder[ i ].order ){
			retraceOrder[ i ].layer.draw();
			retraceOrder[ i ].order = false;
		}
			
}



//chargement des images
this.imageList;
this.gobWalk;
var fullyLoadedImage;
var progressBar = new Kinetic.Shape( {
	drawFunc : function (){
		
		var context = this.getContext();
		
		context.font = "30pt Calibri";
		context.fillStyle = '#3A3131';
		context.fillText("Loading ...  "+Math.round( this.load * 100 )+" %", 0, 0);
		
		context.beginPath();
        context.rect(0, 50, 310, 50);
        context.lineWidth = 5;
        context.strokeStyle = 'black';
        context.stroke();
		
		context.beginPath();
        context.rect(5, 55, 300 * this.load , 40);
		context.fillStyle = '#3A3131';
        context.fill();
	} ,
	x : 200 ,
	y : 200 ,
	load : 0
} );
var updateBarre = function( p ){ progressBar.load = p ; animLayer.draw(); };
animLayer.add( progressBar );
animLayer.draw();
if( typeof( this.imageList ) == "undefined" ){
		
		var name_liste = {  
			clippy :			"Sprite/goblin/goblin1.png" , 
			clipBoard :			"Sprite/goblin/goblin2.png" ,
			
			motifBolter : 		"Sprite/Motif/bolter.png" ,
			motifGrammar : 		"Sprite/Motif/grammar.png",
			motifSkull : 		"Sprite/Motif/skull.png",
			motifClipboard : 	"Sprite/Motif/clipboard.png",
			motifChapelet : 	"Sprite/Motif/chapelet.png",
			
			headSpaceMarine : 	"Sprite/Space Marine head.png",
			bandeau : 			"Sprite/bandeau.png",
			
			clipBoard : 		"Sprite/clipboard.png",
			
			golbin1 :			"Sprite/goblin/goblin1.png" , 
			golbin2 :			"Sprite/goblin/goblin2.png" , 
			golbin3 :			"Sprite/goblin/goblin3.png" , 
			golbin4 :			"Sprite/goblin/goblin4.png" , 
			golbin5 :			"Sprite/goblin/goblin5.png" ,
			
			shadow : 			"Sprite/shadow.png" ,
			
			bolter : 			"Sprite/bolterFull.png" 
		} ;
		
		this.imageList = {};
		
		var fullLoad = [];
		
		var absolutePath = "./";
		
		var imgList = this.imageList;
		
		var compteur = { total : 0 , done : 0 };
		
		for( var i in name_liste ){
			
			this.imageList[ i ] =  new Image();
			this.imageList[ i ].src = absolutePath+name_liste[ i ];
			this.imageList[ i ].name = i;
			
			compteur.total ++;
			
			// on va ecouter la fin du chargement
			fullLoad[ i ]= false ;
			this.imageList[ i ].onload =  function( e ){ 
				
				printOut( "<br> chargement de "+ e.target.name );
				
				fullLoad[ e.target.name ] = true; 
				
				compteur.done ++;
				
				updateBarre( compteur.done / compteur.total  );
				
				for( var k in imgList )
					if( !fullLoad[ k ] )
						return;
				
				animLayer.remove( progressBar );
				
				fullyLoadedImage();
				
				
			} ;
		}
		
		this.gobWalk = [ this.imageList.golbin1 , this.imageList.golbin2 , this.imageList.golbin3 , this.imageList.golbin4 , this.imageList.golbin5 , this.imageList.golbin4 , this.imageList.golbin3 , this.imageList.golbin2 , this.imageList.golbin1 ];  
}

/*
*  from .html5canvastutorials.com
*
 * create function that calculates when a new
 * line should be created based on the width
 */
function wrapText( context, text, x, y, maxWidth, lineHeight){
    var words = text.split(" ");
    var line = "";
 
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

var t = this;



// char / seconde
this.char_par_seconde = 28;

var frame = [
	
	//frame 1
	{ time : ( document.getElementById( "texte_frame_one" ).innerHTML.length / this.char_par_seconde + 1 )*1500 ,
	  setUp : function(){
		
		// frame 1
		
		// dessine le fond
		dessineMotif( fondLayer , t.imageList.motifGrammar , "#3E3E3E" , 25 );
		
		retraceOrder.fond.order = true;
		
		// animation
		
		animLayer.removeChildren();
		
		var anim = new Kinetic.Image( {
			image : t.imageList.headSpaceMarine ,
			x : -400,
			y : 0 
		} );
		animLayer.add( anim );
		
		
		
		new repeatNTimes( 400 , function( f ){
			
			anim.x += 0.5 - ( anim.x + 300 ) / 100;
			
			retraceOrder.anim.order = true;
			
			} , this );
		
		// texte
		dessineTexte( 490 , 100 , 500, 500 , document.getElementById( "texte_frame_one" ).innerHTML );
		
		
		}
	}
	,
	//frame 2
	{ time : ( document.getElementById( "texte_frame_two" ).innerHTML.length / this.char_par_seconde + 1 )*1500 ,
	  setUp : function(){
		
		// frame 2
		
		// dessine le fond
		dessineMotif( fondLayer , t.imageList.motifSkull , "#3E3E3E" , 20 , 0.4 );
		
		retraceOrder.fond.order = true;
		
		// animation
		animLayer.removeChildren();
		
		var gobTab = new Array( 20 );
		// on cree 20 goblins
		for( var k = 0 ; k < gobTab.length ; k ++ ){
			
			gobTab[ k ] = new Kinetic.Shape( {
				drawFunc : function(){
					var context = this.getContext();
					
					context.drawImage( t.imageList.shadow , 0 , 20 , 100 , 70 );
					
					context.drawImage( this.image , 0 , 0 , this.width , this.height );
				},
				image : t.gobWalk[ 0 ] ,
				x : 0,
				y : Math.random()*stage.height*1.1 - stage.height*0.9,
				width : t.gobWalk[ 0 ].width * 0.2,
				height : t.gobWalk[ 0 ].height * 0.2,
			} );
			
			// on prend soin de ne pas les superposer
			var accept = false;
			var exit = 10;
			while( !accept ){
				gobTab[ k ].x = Math.random()*500;
				accept = true;
				for( var j = 0 ; j < k ; j ++ )
					if( OpP.distance( gobTab[ j ] , gobTab[ k ] ) < 70 )
						accept = false;
				
				exit --;
				if( exit < 0 )
					break;
			}
			if( exit >= 0 )
				animLayer.add( gobTab[ k ] );
		}
		
		
		new repeatNTimes( 3000  , function( f ){
			
			for( var k = 0 ; k < gobTab.length ; k ++ ){
				gobTab[ k ].y += 0.5;
				if( gobTab[ k ].y > stage.height + gobTab[ k ].height ){
					gobTab[ k ].y = - gobTab[ k ].height;
					
					var accept = false;
					var exit = 10;
					
					while( !accept ){
						gobTab[ k ].x = Math.random()*500;
						accept = true;
						for( var j = 0 ; j < gobTab.length ; j ++ )
							if( OpP.distance( gobTab[ j ] , gobTab[ k ] ) < 100 )
								accept = false;
						
						exit --;
						if( exit < 0 )
							break;
					}	
				}
				var l =  Math.floor( Math.abs( gobTab[ k ].y * 0.8 ) % t.gobWalk.length );
				
				gobTab[ k ].image = t.gobWalk[ l ];
				
			}
			
			retraceOrder.anim.order = true;
			
			} , this );
		
		// texte
		dessineTexte( 490 , 100 , 500, 500 , document.getElementById( "texte_frame_two" ).innerHTML );
		
		
		
		}
	}
	,
	//frame 3
	{ time : ( document.getElementById( "texte_frame_three" ).innerHTML.length / this.char_par_seconde + 1 )*1500 ,
	  setUp : function(){
		
		// frame 3
		
		// dessine le fond
		dessineMotif( fondLayer , t.imageList.motifBolter , "#3E3E3E" );
		
		retraceOrder.fond.order = true;
		
		// animation
		
		animLayer.removeChildren();
		
		var animB = new Kinetic.Image( {
			image : t.imageList.bolter ,
			x : -200,
			y : 50 
		} );
		animLayer.add( animB );
		
		new repeatNTimes( 500  , function( f ){
			
			animB.x += 0.5 - animB.x / 200;
			
			retraceOrder.anim.order = true;
			
			} , this );
		
		// texte
		dessineTexte( 490 , 100 , 500, 500 , document.getElementById( "texte_frame_three" ).innerHTML );
		
		
		}
	}
	,
	//frame 4
	{ time : ( document.getElementById( "texte_frame_four" ).innerHTML.length / this.char_par_seconde + 1 )*1500 ,
	  setUp : function(){
		
		// frame 1
		
		// dessine le fond
		dessineMotif( fondLayer , t.imageList.motifClipboard , "#3E3E3E" , 35 , 0.4 );
		
		retraceOrder.fond.order = true;
		
		// animation
		
		animLayer.removeChildren();
		
		var animC = new Kinetic.Image( {
			image : t.imageList.clipBoard ,
			x : -150,
			y : 0 
		} );
		animLayer.add( animC );
		
		
		
		new repeatNTimes( 500  , function( f ){
			
			animC.x += 0.5 - animC.x / 200;
			
			retraceOrder.anim.order = true;
			
			} , this );
		
		// texte
		dessineTexte( 490 , 100 , 500, 500 , document.getElementById( "texte_frame_four" ).innerHTML );
		
		}
	}
	,
	//frame 5
	{ time : ( document.getElementById( "texte_frame_five" ).innerHTML.length / this.char_par_seconde + 1 )*1500 ,
	  setUp : function(){
		
		// frame 5
		
		// dessine le fond
		dessineMotif( fondLayer , t.imageList.motifChapelet , "#3E3E3E" , 25 , 0.4 );
		
		retraceOrder.fond.order = true;
		
		// animation
		
		animLayer.removeChildren();
		
		var head = new Kinetic.Image( {
			image : t.imageList.headSpaceMarine ,
			x : -400,
			y : 0 
		} );
		
		var bandeau = new Kinetic.Image( {
			image : t.imageList.bandeau ,
			x : -400 - 150,
			y : 260 
		} );
		
		animLayer.add( head );
		animLayer.add( bandeau );
		
		
		
		new repeatNTimes( 400 , function( f ){
			
			//var v = - ( head.x + 500 ) / 20 - 0.2;
			
			var v = 0.5 - ( head.x + 300 ) / 100;
			
			if( head.x < - 450 )
				v = 0;
			
			head.x += v;
			bandeau.x += v;
			
			retraceOrder.anim.order = true;
			
			} , this );
		
		// texte
		dessineTexte( 490 , 100 , 500, 500 , document.getElementById( "texte_frame_five" ).innerHTML );
		
		
		}
	}
	
];

this.courantUserTexteKey = null;



function dessineTexte( x , y , width , height , texte ){
	
	// char / seconde
	this.char_par_seconde = 25;
	
	var div = document.getElementById( "texte_narration" );
	
	div.style.width = width+"px";
	div.style.height = height+"px";

	div.style.left = x+"px";
	div.style.top = y+"px";
	
	div.innerHTML = "";
	
	var sel = this;
	
	var vitesse = 1000/( this.char_par_seconde );
	var timer = 0;
	var avancement = 0;
	var tampon = "";
	function ajoutLettre( f ){
		
		//printOut( "<br>" +texte.substring( 0 , 10 ) );
		
		var tmp = div.innerHTML;
		
		if( tmp.length == texte.length ){
			if( typeof( this.courantUserTexte ) != "undefined" && this.courantUserTexte != null )
				removeFrameListener( this.courantUserTexte.o , this.courantUserTexte.func );
			this.courantUserTexte = null;
		}
		
		timer += f.timeDiff;
		if( timer < vitesse )
			return;
		
		var c = texte.charAt( avancement );
		
		avancement ++;
		
		timer -= vitesse;
		
		// gestion des balises
		if( c == "<" ){
			for( var i = 0 ; texte.charAt( avancement + i ) != ">" ; i ++ )
				c += texte.charAt( avancement + i );
				
			c+= ">";
			
			avancement += i+1;
			
			//alert( c );
		}
		
		tampon += c;
		
		div.innerHTML = tampon;
	}
	
	if( typeof( this.courantUserTexte ) != "undefined" && this.courantUserTexte != null )
		removeFrameListener( this.courantUserTexte.o , this.courantUserTexte.func );
		
		
	this.courantUserTexte = { o : this , func : ajoutLettre };
	addFrameListener( this , ajoutLettre );
	
}


function dessineMotif( layer , motif , color , espace , reduction ){
	
	// param 
	if( typeof( color ) == "undefined" )
		color = "#3E3E3E";
		
	if( typeof( espace ) == "undefined" )
		 espace = 10;
	
	if( typeof( reduction ) == "undefined" )
		 reduction = 0.7;
	
	// vide le layer
	layer.removeChildren();
	
	// calcul
	var finalw = motif.width * reduction ;
	var finalh = motif.height * reduction ;
	
	// rempli avec une couleur de fond
	var rect = new Kinetic.Shape({
		drawFunc : function(){
			var context = this.getContext();
			
			var grd = context.createLinearGradient(stage.width/2, 0, stage.width/2, stage.height);
			grd.addColorStop(0, "#3A3131" ); 
			grd.addColorStop(0.2, color ); 
			grd.addColorStop(0.8, color ); 
			grd.addColorStop(1, "#3A3131" ); 
			
			context.beginPath();
			context.rect( 0 , 0 , stage.width , stage.height );
			context.fillStyle = grd;
			context.fill();
		}
	} );
	
	
	/*
	var rect = new Kinetic.Rect({
        x: 0,
        y: 0,
        width:  stage.width,
        height: stage.height,
        fill: grd ,
        stroke: "black",
        strokeWidth: 2
    });*/
	
	
	layer.add( rect );
	
	// repete les motifs
	for( var i = 0 ; i < ( stage.width  )/( finalw + espace ) +1 ; i ++ )
	for( var j = 0 ; j < ( stage.height )/( finalh + espace ) +1 ; j ++ ){
		
		var mo = new Kinetic.Image( {
			image : motif ,
			width : finalw ,
			height : finalh ,
			x : i * ( finalw + espace ) ,
			y : j * ( finalh + espace ) 
		} );
		
		layer.add( mo );
	}
	
}



courant = 0;
timeFrame = 0;

// passe a la frame suivante ou lance le jeu
var next = function( prio ){
	
	this.timeFrame = 0;
	
	this.courant ++;
	
	if( this.courant == frame.length ){
		
		if( typeof( prio ) != "undefined" && prio  ){
			// mettre en place la boucle de jeu
			// detruire les layers
			
			dessineTexte( 0 , 0 , 0, 0 , "" );
			
			stage.remove( fondLayer );

			stage.remove( animLayer  );

			stage.remove( texteLayer );
			
			stage.remove( boutonLayer );
			
			fondLayer = null;
			texteLayer = null;
			animLayer = null;
			boutonLayer = null;
			
			stage.stop();
			
			document.body.style.cursor = "default";
			
			new procedure( stage );
			
			return;
		}
		
		this.courant --;
		
		return;
	}
	if( this.courant == frame.length -1 ){
		bouton_texte.text = "go !";
		
		retraceOrder.bouton.order = true;
	}
	frame[ this.courant ].setUp();
}
var start = function(){
	
	frame[ 0 ].setUp();
	
	
}


stage.onFrame(function(frame_temp){
   
	try{
		
		if( timeFrame > frame[ courant ].time ){
			next();
		}
		timeFrame += frame_temp.timeDiff;
		
		retraceLayer();
		
		for( var i in listener )
			listener[ i ].func.call( listener[ i ].objet , frame_temp );
		
	}catch( e ){

		catchError( e );
	}
});


// appel //

// on ne commence que quand la dernière image est chargée
fullyLoadedImage =  function(){ try{ stage.start(); start(); }catch( e ){	catchError( e );}    } ;

// construction du bouton
var bouton_texte = new Kinetic.Text({
                x: stage.width - 300 ,
                y: stage.height - 20,
                text: "skip",
                fontSize: 20,
                fontFamily: "Calibri",
                textFill: "white",
                align: "center",
                verticalAlign: "middle"
            });
	

boutonLayer.add( bouton_texte );

retraceOrder.bouton.order = true;

boutonLayer.on("mousedown", function() {
    next( true );
});
boutonLayer.on("mouseover", function() {
    document.body.style.cursor = "pointer";
});
boutonLayer.on("mouseout", function() {
    document.body.style.cursor = "default";
});

}

}catch( e ){

	catchError( e );
}


