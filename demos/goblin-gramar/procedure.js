function procedure ( stage , MouseEvent ){


var MouseEvent = MouseEvent;


var wordLayer = new Kinetic.Layer();
var palLayer = new Kinetic.Layer();
var animLayer = new Kinetic.Layer();
var lowLayer = new Kinetic.Layer();
var surfaceLayer = new Kinetic.Layer();
var fpsLayer = new Kinetic.Layer();

stage.add( lowLayer );
stage.add( surfaceLayer );
stage.add( wordLayer );
stage.add( palLayer );
stage.add( animLayer );
stage.add( fpsLayer );



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

var option = {
	
	worldDim : new Point( stage.width , stage.height ),
	bastion : new Point( stage.width/2 , stage.height/2 ),
	dureSmash : 300,
	reloadSmash : 20,
	reloadStrike : 20,
	reloadHit : 7,
	reloadTime : 1200,
	spawn_limit : 6,
	spawn_delay : 80,
	vitesse : 0.005
	
};




/* classs */

function AffichableWord( ){
	
	
	
	this.group = new Kinetic.Group();
	
	this.defragmentGroups = [];
	
	this.shape;
	
	// objet texte
	this.texte_healthy;
	this.texte_erased;
	
	this.underLigne;
	
	wordLayer.add( this.group );
	
	this.ork;
	
	this.shadow;
	
	this.imageList ;
	
	this.orkFrame;
	
	if( typeof( this.imageList ) == "undefined" ){
		
		var name_liste = {  
			golbin1 :			"Sprite/goblin/goblin1.png" , 
			golbin2 :			"Sprite/goblin/goblin2.png" , 
			golbin3 :			"Sprite/goblin/goblin3.png" , 
			golbin4 :			"Sprite/goblin/goblin4.png" , 
			golbin5 :			"Sprite/goblin/goblin5.png" ,
			
			shadow : "Sprite/shadow.png" 
		
		} ;
		
		this.imageList = {};
		
		for( var i  in name_liste ){
			
			this.imageList[ i ] =  animateur.imageList[ i ];
		}
		//this.orkFrame = [ this.imageList.golbin1 ,  this.imageList.golbin5  ];  
		this.orkFrame = [ this.imageList.golbin1 , this.imageList.golbin2 , this.imageList.golbin3 , this.imageList.golbin4 , this.imageList.golbin5 , this.imageList.golbin4 , this.imageList.golbin3 , this.imageList.golbin2 , this.imageList.golbin1 ];  
	}
	
	
	AffichableWord.prototype.build = function( direction ){
		
		var shadow = this.imageList.shadow;
		this.shadow =  new  Kinetic.Image( {
				
				image : shadow,
				width : shadow.width * 0.5,
				height : shadow.height * 0.5,
				x : -shadow.width/4,
				y : -shadow.height/4
				
			} );
					
					
		var orkFrame = this.orkFrame;
		
		this.ork =  new  Kinetic.Shape( {
				
				drawFunc : function (){
				
					var context = this.getContext();
					
					
					this.timer ++;
					
					var l = Math.floor( this.timer / 5 );
					
					if( l >= orkFrame.length ){
						l = 0;
						this.timer = 0;
					}
					
					var scale = 0.1;
					var w = orkFrame[ l ].width * scale;
					var h = orkFrame[ l ].height  * scale;
					
					//context.drawImage( orkFrame[ l ]  , -w/2 , h/2  , w , h ); 
					context.drawImage( orkFrame[ l ]  ,- w/2 , -h*0.85  , w , h ); 
				},
				timer : 0
			} );
			
		
		
		this.ork.rotation = -Math.atan2( direction.x , direction.y );
		
		var texte_grp = new Kinetic.Group( );
			
		this.texte_healthy = new Kinetic.Text({
                x: 0,
                y: -15,
                text: "blank",
                fontSize: 12,
                fontFamily: "Calibri",
                textFill: "#4B7142",
                align: "left"
               
            });
			
		this.texte_erased = new Kinetic.Text({
                x: 0,
                y: -15,
                text: "",
                fontSize: 12,
                fontFamily: "Calibri",
                textFill: "#312D24",
                align: "left"
                
            });
			
		texte_grp.add( this.texte_healthy );
		texte_grp.add( this.texte_erased );
			
		
		var animGroup = new Kinetic.Group();
		
		animGroup.add( this.shadow );
		animGroup.add( this.ork );
		
		animGroup.y = 22;
		
		this.group.add( animGroup );
		
		this.group.add( texte_grp );
			
			
		
	}
	AffichableWord.prototype.move = function( pos ){
		
		this.group.x = pos.x;
		this.group.y = pos.y;
		
	}
	AffichableWord.prototype.removeFromStage = function( ){
		wordLayer.remove( this.group );
	}
	AffichableWord.prototype.upDate = function( healthy , erased , underline){
		
		this.texte_healthy.text = healthy;
		
		this.texte_erased.text = erased;
		
		try{ // au premier appel on catch une erreur pour l'acces au canvas
		
		var canvas = this.texte_erased.getCanvas(); 
		var context = this.texte_erased.getContext(); 
		
		context.font = this.texte_erased.fontSize + "pt " + this.texte_erased.fontFamily; 
		context.textBaseline = "middle"; 
		
		var metrics = context.measureText( this.texte_erased.text ); 
		
		this.texte_healthy.x = metrics.width;
		
		}catch( e ){ }
		
		if( typeof( underline ) != "undefined" ){
			
			if( typeof( this.underLigne ) == "undefined" ){
				
				this.underLigne = new  Kinetic.Shape( { 
				
				drawFunc : function (){
					var context = this.getContext();
					 
					if( typeof( this.longeur ) == "undefined"  ) return
						
					var wavex = 5;
					var wavey = 4;
					
					context.strokeStyle = "red";
					context.lineWidth = 1.5;
					
					context.beginPath();
					
					context.moveTo( 0, 0 );
					for( var i = 0 ; i  < this.longeur / wavex ; i ++ )
						context.quadraticCurveTo(  wavex* ( i + 0.5 ) ,  ( ( i%2 == 0 )?(-1):(1) ) *wavey ,  (i+1)*wavex , 0  );
					
					context.stroke();
					/*
					context.beginPath();
					context.moveTo(this.longeur, -15);
					context.lineTo(this.longeur, 5);
					context.stroke();
					
					context.beginPath();
					context.moveTo(0, -15);
					context.lineTo(0, 5);
					context.stroke();
					*/
				},
				x : 0,
				y : 0
				});
				
				this.group.add( this.underLigne );
				
			}
			
			context.font = this.texte_healthy.fontSize + "pt " + this.texte_healthy.fontFamily; 
			context.textBaseline = "middle"; 
			
			metrics = context.measureText( healthy.substr( 0, underline.a ) ); 
			
			this.underLigne.x = this.texte_healthy.x + metrics.width;
			
			metrics = context.measureText( healthy.substr( underline.a, underline.b ) ); 
			
			this.underLigne.longeur = metrics.width;
			
			//printOut( "<br> longeur  "+metrics.width+ "  "+healthy.substr( underline.a, underline.b ) +"  "+underline.b );
			
		}
	}
	
	// fonctionne comme defragmente
	AffichableWord.prototype.finalBlow = function (){
		
		// on supprime tout, pour ne laisser que l'explosion
		while( this.group.getChildren().length != 0 )
		for( var i in this.group.getChildren() )
			this.group.remove( this.group.getChildren()[ i ] );
			
		
			
		this.defragmentGroups.finalBlow = { timer : 50 , g :  new Kinetic.Group()  };
		
		this.defragmentGroups.finalBlow.g.x = 0;
		this.defragmentGroups.finalBlow.g.y = 0;
		
		this.group.add( this.defragmentGroups.finalBlow.g );
		
		// on abonne l'evenement d'animation de particule
		// on s'assure qu'il n'y en a qu'un seul
		removeFrameListener( this , this.marchingParticules );
		addFrameListener( this , this.marchingParticules ); 
		
		for( var k = 0 ; k < 20 ; k ++ ){
			var particule = new Kinetic.RegularPolygon({
					x: 0,
					y: 0,
					sides: 3,
					radius: Math.random()*10 + 10,
					//fill: "red",
					//stroke: "black",
					//strokeWidth: 1
				});
				
				
			particule.rotate( Math.random() * Math.PI );
				
			// on définit sa couleur à partir du tableau de couleur possible
			particule.fill = color_particule[  Math.floor( Math.random()*color_particule.length ) ];
				
			// random sur un cercle
			var a = Math.PI * 2 * Math.random();
			particule.direction = new Point( Math.cos ( a ) , Math.sin( a ) );
				
			particule.distance = 0;
				
			this.defragmentGroups.finalBlow.g.add( particule );
		}
		
	}
	
	// initialise un nouvel element de la defragmentsGroup, ils contient les informations pour que le marchingParticules fonctionne,
	// on lance l'ecoute de marchingParticules
	AffichableWord.prototype.defragmente = function( erased , direction  ){
		
		if( typeof( this.defragmentGroups[erased] ) == "undefined" || this.defragmentGroups[erased] == null ){
			
			// préparation du canvas
			var canvas = this.texte_erased.getCanvas(); 
			var context = this.texte_erased.getContext(); 
			
			context.font = this.texte_erased.fontSize + "pt " + this.texte_erased.fontFamily; 
			context.textBaseline = "middle"; 
			
			//mesure
			var metrics = context.measureText( erased ); 
			
			// on position le groupe au bon emplacement
			this.defragmentGroups[erased] = { timer : 40 , g :  new Kinetic.Group() , direction : direction };
			
			this.defragmentGroups[erased].g.x = metrics.width - 2;
			this.defragmentGroups[erased].g.y =  -10;
			
			
			this.group.add( this.defragmentGroups[erased].g );
			
			// on abonne l'evenement d'animation de particule
			// on s'assure qu'il n'y en a qu'un seul
			removeFrameListener( this , this.marchingParticules );
			addFrameListener( this , this.marchingParticules ); 
			
			
			
			
		}
	}
	
	var color_particule = [
		"#539B85",
		"#638E70",
		"#767E57",
		"#8B6D3C",
		"#996129"
	];
	
	AffichableWord.prototype.marchingParticules = function ( frame ){
		
		var none = true;
		
		for( var i in this.defragmentGroups ){
			
			
			if(  typeof( this.defragmentGroups[ i ] ) == "undefined" || this.defragmentGroups[ i ] == null ) continue;
			
			none = false;
			
			
			
			// on fait spawn des nouvelles particules
			if( ( Math.random() +0.5 ) * 30  < this.defragmentGroups[ i ].timer  ){
				
				var particule = new Kinetic.RegularPolygon({
					x: 0,
					y: 0,
					sides: 3,
					radius: Math.random()*10 + 5,
					//fill: "red",
					//stroke: "black",
					//strokeWidth: 1
				});
				
				
				particule.rotate( Math.random() * Math.PI );
				
				// on définit sa couleur à partir du tableau de couleur possible
				particule.fill = color_particule[  Math.floor( Math.random()*color_particule.length ) ];
				
				if( typeof( this.defragmentGroups[ i ].direction ) == "undefined" || this.defragmentGroups[ i ].direction == null ){
					// random sur un cercle
					var a = Math.PI * 2 * Math.random();
					particule.direction = new Point( Math.cos ( a ) , Math.sin( a ) );
					
				} else{
					// on dévie le vecteur direction
					var dispersion = ( Math.random() * 2 - 1 ) * 0.4;
					
					particule.direction = new Point( this.defragmentGroups[ i ].direction.x + this.defragmentGroups[ i ].direction.y * dispersion , this.defragmentGroups[ i ].direction.y - this.defragmentGroups[ i ].direction.x * dispersion );
				}
				
				particule.distance = 0;
				
				this.defragmentGroups[ i ].g.add( particule );
			}
			
			// on avance les particules existantes
			var distance_max = 50;
			for( var j in this.defragmentGroups[ i ].g.getChildren() ){
				
				var p = this.defragmentGroups[ i ].g.getChildren()[ j ];
				
				// la vitesse est exponentielle décroissante
				var vit = distance_max / ( p.distance + 10 ) * 3;
				
				p.distance += vit;
				
				p.x = p.distance * p.direction.x;
				p.y = p.distance * p.direction.y;
				
				// la taille diminue lineairement avec la distance
				var scale = Math.max( 0.5 , 1- (p.distance / ( distance_max + 10 ) ) );
				
				p.setScale( scale , scale );
				
				if( p.distance > ( distance_max-1) )
					this.defragmentGroups[ i ].g.remove( p );
				
				//printOut( "<br> "+p.distance);
				
			}
			
			
			// on gere sa destruction
			this.defragmentGroups[ i ].timer --;
			
			if( this.defragmentGroups[ i ].timer < 0 ){
				// on le supprimer
				this.group.remove( this.defragmentGroups[ i ].g );
				
				this.defragmentGroups[ i ] = null;
			}
		}
		
		if( none )
			removeFrameListener( this , this.marchingParticules );
	
	}

	
	// donne le point correspondant à la fin du mot 
	AffichableWord.prototype.getPointAt = function( erased ){
		
		var canvas = this.texte_erased.getCanvas(); 
		var context = this.texte_erased.getContext(); 
		
		context.font = this.texte_erased.fontSize + "pt " + this.texte_erased.fontFamily; 
		context.textBaseline = "middle"; 
		
		var metrics = context.measureText( erased ); 
		
		
		return new Point( this.group.x + metrics.width , this.group.y + 5 );
	}
}

function MecaniqueWord ( correct , fals , pos ){
	
	// relatif au deplacement
	this.pos = pos;
	
	this.vitesse = option.vitesse;
	
	this.direction = new Point( - this.pos.x + option.bastion.x , - this.pos.y + option.bastion.y );
	
	this.distance = OpP.norme( this.direction );
	
	this.direction = OpP.normalise( this.direction );
	
	//relatif a la recherche de mot
	this.correct = correct;
	this.fals = fals;
	this.validation = 0;
	this.prefix = true;
	
	this.underline = { a : 0 , b : 0 };
	
	// partie graphique
	this.affichable = new AffichableWord();
	this.affichable.build( this.direction );
	
	
	MecaniqueWord.prototype.walk = function( frame ){
		
		this.distance -= frame.timeDiff * this.vitesse;
		
		this.pos.x += this.direction.x * frame.timeDiff * this.vitesse;
		this.pos.y += this.direction.y * frame.timeDiff * this.vitesse;
		
		this.affichable.move( this.pos );
		
		if( this.distance < 30 ){
			
			this.death();
			
			missTable.push( { fals: this.fals , correct : this.correct  } );
			
		}
		
	}
	MecaniqueWord.prototype.death = function( ){
		
		this.affichable.finalBlow();
		
		this.removeFromEngine( );
		
		new delaiBienPratique( 40, this.removeFromStage , this );
		
		printOut("<br>  reset apres mort "+frappeCoord.candidat.length );
	}
	MecaniqueWord.prototype.removeFromStage = function( ){
		this.affichable.removeFromStage();
	}
	
	MecaniqueWord.prototype.removeFromEngine = function( ){
	
		for( var i = 0 ; i < engine.wordStock.length ; i ++  )
			if( engine.wordStock[i] == this ){
				
				engine.wordStock.splice( i , 1 );
			
				return;
			}
	}
	
	// determine si on va pouvoir accepter le caratere
	MecaniqueWord.prototype.primarAccepteChar = function ( c ){
		
		
		if( !this.prefix ) return false;
		
		for( var i = 0 ; i < c.length && this.validation + i < this.correct.length ; i ++ ){
			//printOut("<br>  ~~~ "+this.correct+" ["+this.correct.charAt(this.validation + i) +"]  ["+ c.charAt(i)+"]");
			if( this.correct.charAt(this.validation + i) != c.charAt(i) ) return false;
				
		}
		
		return true;
	}
	
	MecaniqueWord.prototype.accepteChar = function ( c ){
	
		this.setValidation( this.validation + c.length );
		
		if( this.validation > 0 ) this.declencheTir();
		
		if( this.validation == this.correct.length ){
			
			
			this.setValidation( 0 );
		
			this.prefix = false;
			
			this.death();
			
			return true;

		}
		return false;
		
		
	}
	
	MecaniqueWord.prototype.declencheTir = function (){
		
		var target = this.affichable.getPointAt( this.correct.substr( 0 , this.validation ) );
		
		paladin.fireAt( target )
		
		
		var direction = OpP.normalise( new Point( target.x - option.bastion.x , target.y - option.bastion.y  ) );
		
		//declenche defragmentation du texte
		this.affichable.defragmente( this.correct.substr( 0 , this.validation ) , direction );
		
		animateur.startTremblement();
	}
	
	MecaniqueWord.prototype.invalideChar = function(){
		
		this.setValidation( 0 );
		
		this.prefix = false;
		
	}
	
	MecaniqueWord.prototype.setValidation = function( v ){
	
		this.validation = v;
		
		this.update();
	}
	
	MecaniqueWord.prototype.popSurlignage = function(  ){
		
		printOut("<br> pop surlignage sur "+this.correct );
		
		var ana = this.analyse();
		
		this.underline.a = ana[ 0 ].length;
		this.underline.b = ana[ 1 ].fals.length;
		
		this.update();
	}
	
	MecaniqueWord.prototype.sortShell = function( tab , fonction_compare ){
			
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
	
	MecaniqueWord.prototype.analyse = function(){
		
		
		var hash_correct = this.correct.split( " " , this.correct.length );
		var hash_fals = this.fals.split( " " , this.fals.length );
		
		var analyse = []
		
		var j = 0;
		
		var i1 = 0;
		var i2 = 0;
		
		while( i1 < hash_fals.length && i2 < hash_correct.length ){
			
			
			// union
			var tmp = "";
				
			for( var i = 0 ; i1 + i < hash_fals.length && i2 + i < hash_correct.length && hash_fals[ i1 + i ] == hash_correct[ i2 + i ] ; i ++ ){
				if( tmp.length != 0 ) tmp += " ";
					tmp += hash_fals[ i1 + i ];
			}
			
			if( tmp.length != 0 ) tmp += " ";
			if( tmp.length != 0 && i1 != 0 ) tmp = " " + tmp ;
			
			i1 += i;
			i2 += i;
				
			analyse.push( tmp );
			
			// fork
			var tab = [];
				
			for( var i = 0 ; i + i1 <   hash_fals.length ; i ++ )
				for( var j = 0 ; j + i2 <   hash_correct.length ; j ++ )
					if( hash_fals[ i1 + i ] == hash_correct[ i2 + j ] )
						tab.push( { i1 : i + i1 , i2 : j + i2 , d : i + j } );
				
			if( tab.length == 0 )
				tab.push( { i1 : hash_fals.length , i2 : hash_correct.length , d :  hash_correct.length + hash_fals.length } );
			
			
			this.sortShell( tab , function( a , b ){ return a.d > b.d } );
			
			var tmp1 = "";
			for(  ; i1 < tab[ 0 ].i1 ; i1 ++ ){
				if( tmp1.length != 0 ) 
					tmp1 += " ";
				tmp1 += hash_fals[ i1 ];
			}
			
			var tmp2 = "";
			for(  ; i2 < tab[ 0 ].i2 ; i2 ++ ){
				if( tmp2.length != 0 ) 
					tmp2 += " ";
				tmp2 += hash_correct[ i2 ];
			}
			
			analyse.push( { correct : tmp2 , fals : tmp1 } );
		}
		/*
		printOut( "<br> ~ analyse " );
		for( var i in analyse )
			if( i % 2 == 0 )
				printOut( "<br> ~~"+analyse[ i ] );
			else
				printOut( "<br> ~~"+analyse[ i ].correct +" - "+ analyse[ i ].fals );
		*/
		return analyse;
	}
	
	MecaniqueWord.prototype.update = function(){
		
		var erased = this.correct.substr( 0 , this.validation );
		
		var ana = this.analyse();
		
		var j = 0;
		
		// j est la partie de l'analyse dans laquelle on se trouve
		for( var i = 0 ; ; ){
			
			if( j % 2 == 0 )
				if( i + ana[ j ].length >= this.validation ) break;
				else i += ana[ j ].length;
			else
				if( i + ana[ j ].correct.length >= this.validation ) break;
				else i += ana[ j ].correct.length;
			j ++ ;
		}
		
		var healthy;
		
		if( j % 2 == 0 ){
			// j est une partie commune
			
			var indexDansSeg = this.validation - i;
			
			healthy = "";
			for( var k = indexDansSeg ; k < ana[ j ].length ; k ++ )
				healthy += ana[ j ].charAt( k );
			
		} else {
			// j est un fork
			
			var indexDansSeg = this.validation - i;
			
			for( var k = 0 ; k < indexDansSeg && ana[ j ].correct.charAt( k ) == ana[ j ].fals.charAt( k ) ; k ++ );
			
			
			if( k == indexDansSeg ){
				// on est pas encore dans la zone de fork,
				healthy = "";
				for(  ; k < ana[ j ].fals.length ; k ++ )
					healthy += ana[ j ].fals.charAt( k );
				
			} else {
				
				// on découpe la partie déjà accepté de correct en block séparés par des espaces
				var spli = ana[ j ].correct.substr( 0 , indexDansSeg ).split( " " , ana[ j ].correct.length );
				
				var block = spli.length;
				
				if( spli[ spli.length-1].length == 0 )
					block --;
					
				var splifalse = ana[ j ].fals.split( " " , ana[ j ].fals.length );
				
				// si le correct est dans le premier block, on commence par le suivant
				healthy = "";
				for( var k = block ; k < splifalse.length ; k ++ )
					healthy += splifalse[ k ]+" ";
				
				if( spli[ spli.length-1].length != 0 )
					healthy = " "+healthy;
				
			}
		}
		
		// on rempli avec la suite
		for( var k = j+1 ; k < ana.length ; k ++ )
			if( k % 2 == 0 )
				healthy += ana[ k ];
			else
				healthy += ana[ k ].fals;
			
		
		
		// calcul du soulignage
		
		var indexHealthy = this.fals.length+1 - healthy.length;
		
		
		var ss = { a : this.underline.a - indexHealthy , b : this.underline.b };
		
		if( ss.a < 0 ){
			ss.b = Math.max( 0 , ss.b + ss.a);
			ss.a = 0;
		}
		
		if( this.underline.b == 0 )
			this.affichable.upDate( healthy, erased  );
		else
			this.affichable.upDate( healthy, erased , ss );
		
	}
	
	this.update();
}

function FrappeCoordinator ( ) {
	
	this.candidat = [];
	
	this.buffer = "";
	
	this.indecisionBuffer = "";
	
	this.resetCandidat = function(){
		this.candidat = [];
		
		for( var i in engine.wordStock )
			this.candidat.push( engine.wordStock[ i ] );
	}
	
	// force les candidats à se préparer à accepter un nouveau mot
	this.resetValidationCandidat = function(){
		for( var i = 0 ; i < this.candidat.length ; i ++ ){
			this.candidat[ i ].setValidation( 0 );
			this.candidat[ i ].prefix = true;
		}
	}
	
	
	this.resetCandidat();
	
	
	this.backwardCharRegular = function( ){
		
		this.resetCandidat();
		this.resetValidationCandidat();
		
		if( this.buffer.length > 0 ){
		
			this.buffer = this.buffer.substr( 0 , this.buffer.length -1 );
			
			this.recoveryChar();
		}
		
		// on previent l'animateur
		animateur.updateTampon();
	}
	
	this.backwardChar = this.backwardCharRegular;
	
	this.backwardCharIgnoreMatch = function( ){ }
	
	this.recoveryChar = function( ){
		
		var max_word = 5;
		
		var spli = this.buffer.split( " "  );
		
		for( var j = 0 ; j < spli.length ; j ++ ){
			if( spli[ j ].length == 0 ){
				spli.splice( j , 1 );
				j--;
			}
		}
		
		var tmp = "";
		
		var flagEspaceRemoved = false;
		
		if( spli.length > 0 && spli[spli.length-1].length == 0 )
			flagEspaceRemoved = true;
		
		// on part du plus de mot dans le buffer pour aller vers le moins
		
		
		
		for( var i = 0 ; i < Math.min( max_word , spli.length ) ; i ++ ){
			
			tmp = "";
			for( var j = Math.max( 0 , spli.length - max_word ) + i ; j < spli.length ; j ++ )
				tmp += ( (tmp.length == 0)?( "" ):(" ") ) + spli[ j ];
			
			printOut("<br> recherche dans le buffer avec le mot ["+tmp +"]  "+spli[ spli.length-1]);
			
			var l = 0;
			for( var j = 0 ; j < this.candidat.length ; j ++ ){
				//printOut( "<br> recover  ["+tmp+"]" );
				if( this.candidat[ j ].primarAccepteChar( tmp ) ){
					
					
					// pour ne pas que ca soit perturbant, on va rétablir le buffer
					this.buffer = "";
					for( var j = 0 ; j < i ; j ++ )
						this.buffer +=  spli[ j ] + " ";
					
					this.indecisionBuffer = "";
					
					printOut( "<br> !recover  "+tmp );
					
					this.accepteChar( tmp );
					
					return;
				}
			}
			
		}
		
		/*
		// la on le faisait dans le mauvais sens ( recher du mot match le plus petit plutot que du plus grand 
		for( var i = spli.length-1 ; i >= 0 ; i -- ){
			
			if( spli[ i ].length == 0 ) continue;
			tmp = spli[ i ]+ ( (tmp.length == 0)?( "" ):(" ") )+tmp;
			
			printOut("<br> recherche dans le buffer avec le mot ["+tmp +"]  ");
			
			var l = 0;
			for( var j = 0 ; j < this.candidat.length ; j ++ ){
				printOut( "<br> recover  ["+tmp+"]" );
				if( this.candidat[ j ].primarAccepteChar( tmp ) ){
					
					this.buffer = "";
					this.indecisionBuffer = "";
					
					printOut( "<br> !recover  "+tmp );
					
					this.accepteChar( tmp );
					
					return;
				}
			}
			
		}
		*/
		
		var rec_buffer = this.buffer ;
		var rec_inde = this.indecisionBuffer ;
		
		this.buffer = "";
		this.indecisionBuffer = "";
		
		
		// si on a rien trouver, il faut quand meme positioner les prefix sur faux
		if( !flagEspaceRemoved ) this.accepteChar( tmp );
		
		this.buffer = rec_buffer;
		this.indecisionBuffer = rec_inde;
		
	}
	
	this.accepteCharRegular = function( c ){
		
		
		if( ( c == "_" || c == " " ) && this.buffer.substr( this.buffer.length-1 , 1 ) == c ) return;
		
		this.indecisionBuffer += c;
		
		this.buffer += c;
		
		for( var i = 0 ; i < this.candidat.length ; i ++ ){
			if( !this.candidat[ i ].primarAccepteChar( c ) ){
				
				this.candidat[ i ].invalideChar();
				
				this.candidat.splice( i , 1 );
				i--;
				
			}else if( this.candidat[ i ].accepteChar( c ) ){
				
				// si apres acceptation le mot est complet
				
				this.buffer = "";
				this.resetCandidat();
				this.resetValidationCandidat();
				
				break;
				
			}
		
		}
		
		
		if( ( c == "_" || c == " " ) ){
			for( var i in engine.wordStock )
				if( !engine.wordStock[ i ].prefix ){
					this.candidat.unshift( engine.wordStock[ i ] );
					engine.wordStock[ i ].setValidation( 0 );
					engine.wordStock[ i ].prefix = true;
				}
		}
		
		
		
		printOut( "<br> - nb candidat:"+this.candidat.length +" tampon |"+this.buffer+"| c ["+c+"]"  );
		
		// on previent l'animateur
		animateur.updateTampon();
		
		return ( this.candidat.length > 0 );
		
	}	

	this.accepteChar = this.accepteCharRegular;
	
	this.accepteCharIgnoreMatch = function( c ){
		
		if( engine.wordStock.length == 0 ) return;
		
		var plusProche = engine.wordStock[ 0 ];
		
		for( var i in engine.wordStock )
			if( engine.wordStock[ i ].distance < plusProche.distance )
				plusProche = engine.wordStock[ i ];
				
		plusProche.accepteChar( c );
			
	}
	
	
	// Mode possible :
	// 		Regular
	// 		IgnoreMatch
	this.swapMode = function( mode ){
		
		if( this.furySession ) return;
		
		this.backwardChar = this[ "backwardChar"+mode ];
		this.accepteChar = this[ "accepteChar"+mode ];
		
		animateur.swapMode( mode );
	}
	
	/*
	 * Fury
	 */
	this.context_rec;
	this.furyKey;
	this.furySession = false;
	this.hitRemaining;
	
	this.startFurySession = function (){
		
		this.context_rec = {
			backwardChar : this.backwardChar,
			accepteChar  : this.accepteChar
		}
		
		// on définit les paramètres aléatoires
		var possibleFuryKey = [ "!" , "*" ];
		this.furyKey =  possibleFuryKey[  Math.floor( Math.random()*possibleFuryKey.length ) ];
		
		this.hitRemaining = ( Math.random() * 0.5 + 1 ) * option.reloadHit;
		
		// on redéfinit les fonctions d'ecoute
		this.backward = function(){};
		this.accepteChar = function( c ){
			
			if( c != this.furyKey ) return;
			
			this.hitRemaining --;
			
			if( this.hitRemaining <= 0 )
				this.stopFurySession();
		}

		
		this.furySession = true;
		
		animateur.startFurySession();
	}
	
	this.stopFurySession = function (){
		
		this.furySession = false;
		
		this.backward = this.context_rec.backward;
		this.accepteChar = this.context_rec.accepteChar;
		
		
		animateur.stopFurySession();
		
	}
}


function AffichablePaladin(){
	
	this.group = new Kinetic.Group();
	
	this.shape;
	this.effect;
	
	this.imageList = { 
		fixe : 		animateur.imageList.fixe,
		shadow : 	animateur.imageList.shadow ,
		flamme : 	animateur.imageList.flamme_spm
		
		} ;
	
	
	//this.canon = new Point( 54.60 , 66.7 );
	this.canon = new Point(  19  , 54.60 );
	
	/*
	maintenant le chargement est délégué à l'animateur
	if( typeof( this.imageList ) == "undefined" ){
		
		var name_liste = {  
			fixe : "Sprite/Space Marine fixe.png" , 
			shadow : "Sprite/shadow.png" , 
			flamme : "Sprite/flamme.png" 
			} ;
		
		this.imageList = {};
		
		for( var i  in name_liste ){
			
			this.imageList[ i ] =  new Image();
			this.imageList[ i ].src = name_liste[ i ];
		}
	}*/
	
	
	
	this.fireEnCour = false;
	AffichablePaladin.prototype.fireAt = function ( target ){
		
		var x  = target.x - this.group.x;
		var y  = target.y - this.group.y;
		
		this.distance = Math.sqrt( x*x + y*y ) - Math.sqrt( this.canon.x*this.canon.x + this.canon.y*this.canon.y )
		
		var angle = -Math.atan2( x , y );
		
		this.group.rotation = angle ;
		
		
		// si il est deja en train de tirer, on stoppe l'animation en cour
		if( this.fireEnCour )
			this.stopFire();
		
		this.fireEnCour = true;
		
		
		// on met en place l'animation
		addFrameListener( this , this.onFire );
		this.timerFrame = 9;
		
		// variable dont à besoin la kinetic shape
		var canon = this.canon;
		
		var distance = this.distance;
		
		var flamme =  this.imageList.flamme; 
		
		this.effect = new  Kinetic.Shape( {
				
				drawFunc : function (){
					var context = this.getContext();
					
					
					var A = new Point(  canon.x , canon.y  );
					var B = new Point( canon.x +( Math.random() * 2 - 1 ) * 10 , canon.y + distance  );
					
					context.beginPath();
					context.moveTo( A.x , A.y );
					context.lineTo( B.x , B.y );
					
					context.strokeStyle = "#C67D04";
					context.lineWidth = 3;
					
					context.stroke();
				
					context.beginPath();
					context.moveTo( A.x , A.y );
					context.lineTo( B.x , B.y );
					
					context.strokeStyle = "#EEEE00";
					context.lineWidth = 1.5;
					
					context.stroke();
					
					if( Math.floor( this.timer / 3 ) % 2 == 0 ){
						context.drawImage( flamme ,  canon.x - 15 , canon.y -10  , 30 , 70 );
					}
					
				},
				x : 0,
				y : 0
		});
		
		this.effect.timer = this.timerFrame ;
		
		this.group.add( this.effect );
		
	}
	this.timerFrame = 3;
	this.distance ;
	AffichablePaladin.prototype.onFire= function ( frame ){
		
		this.effect.timer = this.timerFrame;
		
		if( this.timerFrame  <= 0 )
			this.stopFire();
		
		
		this.timerFrame --;
		
	}
	AffichablePaladin.prototype.stopFire= function (  ){
		removeFrameListener( this , this.onFire );
		this.group.remove( this.effect );
		this.fireEnCour = false;
	}
	
	AffichablePaladin.prototype.build = function(){
			
			
			
			var shadow_img = this.imageList.shadow;
			shadow = new  Kinetic.Shape( {
				
				drawFunc : function (){
					var context = this.getContext();
					
					context.drawImage( shadow_img ,  -shadow_img.width/2  , -shadow_img.height/2 +5 , shadow_img.width , shadow_img.height );
					
					
				},
				x: stage.width / 2,
                y: stage.height / 2
			});
			
			this.shape = new  Kinetic.Shape( {
				
				drawFunc : function (){
					var context = this.getContext();
					
					
					
					context.drawImage( this.img_l.fixe ,  -38.40 , -19.20  , 75 , 70 );
					
					
				},
				x : 0,
				y : 0
			});
			
			this.shape.img_l = this.imageList ;
			
			this.group.x = option.bastion.x;
			this.group.y = option.bastion.y;
			
			this.group.rotate( 0 );
			
			this.group.add( this.shape );
			
			
			palLayer.add( shadow );
			
			palLayer.add( this.group );

	}
	this.build();
}

var fullyLoadedImage;
function Animateur(){
	
	//chargement des images
	this.imageList ;
	
	if( typeof( this.imageList ) == "undefined" ){
		
		var name_liste = {  
			blast :			"Sprite/blast 2.png" , 
			pipe : 			"Sprite/pipe engine.png" , 
			tube : 			"Sprite/tube.png" , 
			pistonCorps : 	"Sprite/piston corps.png" , 
			pistonBras : 	"Sprite/piston bras.png" , 
			fall : 			"Sprite/clippy fall.png" , 
			flamme : 		"Sprite/flamme canon.png" , 
			bulle : 		"Sprite/bulle.png" , 
			launch : 		"Sprite/launch clippy.png" , 
			clippy : 		"Sprite/clippy.png" ,
			fond : 			"Sprite/fond2.png" ,
			bang : 			"Sprite/bang.png" ,
			arrow : 		"Sprite/arrow.png" ,
			key : 			"Sprite/key.png" ,
			chargeur : 		"Sprite/chargeur.png" ,
			bolter : 		"Sprite/bolter.png" ,
			roll1 : 		"Sprite/roll1.png" ,
			roll2 : 		"Sprite/roll2.png" ,
			roll3 : 		"Sprite/roll3.png" ,
			rollm3 : 		"Sprite/roll-3.png" ,
			rollm2 : 		"Sprite/roll-2.png" ,
			keyboard : 		"Sprite/keyboard.png" ,
			motifSkull :	"Sprite/Motif/skull.png" ,
			
			fixe : 			"Sprite/Space Marine fixe.png" , 
			shadow : 		"Sprite/shadow.png" , 
			flamme_spm : 	"Sprite/flamme.png" ,
			
			golbin1 :			"Sprite/goblin/goblin1.png" , 
			golbin2 :			"Sprite/goblin/goblin2.png" , 
			golbin3 :			"Sprite/goblin/goblin3.png" , 
			golbin4 :			"Sprite/goblin/goblin4.png" , 
			golbin5 :			"Sprite/goblin/goblin5.png" 
			
		} ;
		
		
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
		
		var absolutePath = "./";
		
		this.imageList = {};
		
		var fullLoad = [];
		
		var imgList_tmp = this.imageList;
		
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
				
				for( var k in imgList_tmp )
					if( !fullLoad[ k ] )
						return;
						
				animLayer.remove( progressBar );
				
				fullyLoadedImage();
				
				
			} ;
		}
		
		this.imageList.roll = [ this.imageList.roll1 , this.imageList.roll2 , this.imageList.roll3 , this.imageList.roll2 , this.imageList.roll1 , this.imageList.rollm2 , this.imageList.rollm3 , this.imageList.rollm2 ];
		fullLoad.roll = true ;
	
	}
	
	
	// affiche le fond
	
	var fond = this.imageList.fond;
	
	lowLayer.add(  new  Kinetic.Shape( {
				
				drawFunc : function (){
				
					var context = this.getContext();
					context.drawImage( fond  , 0 , 0 , option.worldDim.x , option.worldDim.y , 0 , 0 , option.worldDim.x , option.worldDim.y  ); 
				}
			} )
		);
	
	
	// update des cooldown
	this.strikeBarre;
	this.smashBarre;
	
	this.colorSet = { reload : "#DD9B00" , ready : "#C55D00" , onway : "#9A2601" };
	
	this.buildBarre = function(){
		
		this.strikeBarre = new GenericLiquidBarre( 50 , 680 , 50 , 150 ,  "black" );
		
		this.smashBarre = new GenericLiquidBarre( 130 , 680 , 50 , 150 ,  "black" );
		
		this.smashBarre.setLevel( 1 );
		this.strikeBarre.setLevel( 1 );
		
		//this.updateCoolDownBonus();
		
		addFrameListener( this.strikeBarre , this.strikeBarre.eachFrame );
		addFrameListener( this.smashBarre , this.smashBarre.eachFrame );

		stage.add( this.smashBarre.layer );
		stage.add( this.strikeBarre.layer );
		
	}
	
	this.timer_blink_smash_barre = 0;
	this.blink_smash_barre = function(){
		this.timer_blink_smash_barre --;
		if( this.timer_blink_smash_barre <= 0 ){
			
			this.smashBarre.setColor( this.colorSet.ready );
			this.timer_blink_smash_barre = 40;
		}
		if( this.timer_blink_smash_barre == 20 )
			this.smashBarre.setColor( this.colorSet.reload );
	}
	this.timer_blink_strike_barre = 0;
	this.blink_strike_barre = function(){
		this.timer_blink_strike_barre --;
		if( this.timer_blink_strike_barre <= 0 ){
			
			this.strikeBarre.setColor( this.colorSet.ready );
			this.timer_blink_strike_barre = 40;
		}
		if( this.timer_blink_strike_barre == 20 )
			this.strikeBarre.setColor( this.colorSet.reload );
	}
	
		
	this.updateCoolDownBonus = function(){
		
		if( engine.isSmashMode ){
			// on  way
			this.smashBarre.setColor( this.colorSet.onway );
			
		}else if(  engine.reloadSmash < 0 ){
			// fresh to use
			this.smashBarre.setColor( this.colorSet.ready );
			
			removeFrameListener( this , this.blink_smash_barre  );
			
		} else if( engine.reloadSmash ==  0 ){
			// cooldown
			removeFrameListener( this , this.blink_smash_barre  );
			addFrameListener( this , this.blink_smash_barre  );
			
		} else {
			// on tic reload
			this.smashBarre.setColor( this.colorSet.reload );
			this.smashBarre.setLevel( 1-engine.reloadSmash/option.reloadSmash );
			printOut( "<br>"+ (1-engine.reloadSmash/option.reloadSmash) );
		}
		
		if( engine.isStrikeMode ){
			// on  way
			this.strikeBarre.setColor( this.colorSet.onway );
			
		}else if(  engine.reloadStrike < 0 ){
			// fresh to use
			this.strikeBarre.setColor( this.colorSet.ready );
			
			removeFrameListener( this , this.blink_strike_barre  );
			
		} else if( engine.reloadStrike ==  0 ){
			// cooldown
			removeFrameListener( this , this.blink_strike_barre  );
			addFrameListener( this , this.blink_strike_barre  );
			
		} else {
			// on tic reload
			this.strikeBarre.setColor( this.colorSet.reload );
			this.strikeBarre.setLevel( 1-engine.reloadStrike/option.reloadStrike ); 
		
		}
			
			
		
		//this.smashBarre.load
		//this.smashBarre.load
	}
	
	this.buildBarre();
	
	
	// affichage tampon
	this.blinkZoneTampon ;
	this.straightZoneTampon ;
	this.fontZoneTampon ;
	this.timerTampon = 0;
	this.buildTampon = function(){
		
		addFrameListener( this , this.blinkTampon );
		
		var grp = new Kinetic.Group();
		
		this.blinkZoneTampon = new Kinetic.Text({
				x:0,
                y: 0,
                text: "",
                fontSize: 40,
                fontFamily: "EatyourfaceRegular",
                textFill: "343232",
                align: "right",
                verticalAlign: "middle"
				} );
		this.straightZoneTampon = new Kinetic.Text( { 
				x:0,
                y: 0,
                text: "",
                fontSize: 40,
                fontFamily: "EatyourfaceRegular",
                textFill: "343232",
                align: "left",
                verticalAlign: "middle"
				
				} );
		this.fontZoneTampon = new Kinetic.Shape( { 
			drawFunc : function() { }
			
		} );
		
		grp.add( this.fontZoneTampon );
		grp.add( this.straightZoneTampon );
		grp.add( this.blinkZoneTampon );
		
		grp.x = 300;
		grp.y = 200;
		
		animLayer.add( grp );
	}
	this.updateTampon = function(){
		
		if( typeof( frappeCoord.buffer ) != "undefined" && frappeCoord.buffer.length > 0 ){
		
			this.blinkZoneTampon.text = frappeCoord.buffer.substr( frappeCoord.buffer.length -1 , 1 );
			if( this.blinkZoneTampon.text == " ")
				this.blinkZoneTampon.text = "_";
			this.straightZoneTampon.text = frappeCoord.buffer.substr( Math.max( 0 , frappeCoord.buffer.length -1-15 ) , Math.min( frappeCoord.buffer.length -1 , 15 ) );
			
		} else {
			this.straightZoneTampon.text = "";
			this.blinkZoneTampon.text = "";
		}
		
		var canvas = this.straightZoneTampon.getCanvas(); 
		var context = this.straightZoneTampon.getContext(); 
		
		context.font = this.straightZoneTampon.fontSize + "pt " + this.straightZoneTampon.fontFamily; 
		
		var metrics = context.measureText( this.straightZoneTampon.text.concat( this.blinkZoneTampon.text ) ); 
		
		this.straightZoneTampon.x = -metrics.width ;
		
	}
	this.blinkTampon = function(){
		
		this.timerTampon ++;
		
		this.blinkZoneTampon.setRotation( 0.1*Math.sin( Math.PI * this.timerTampon / 50 *7 ) );
		this.blinkZoneTampon.y = Math.sin( Math.PI * this.timerTampon / 50 *5 ) * 2;
		
		if( this.timerTampon > 50 )
			this.timerTampon = 0;
		
	}
	this.buildTampon();
	
	//orbital strike
	this.blastTab = [];
	this.countStrike;
	
	this.animChargeTube ;
	this.preOrbitalStrike = function(){
		
		
		var pipe = this.imageList.pipe;
		var tube = this.imageList.tube;
		var clippy = this.imageList.clippy;
		var pistonCorps = this.imageList.pistonCorps;
		var pistonBras = this.imageList.pistonBras;
		var flamme = this.imageList.flamme;
		var bulle = this.imageList.bulle;
		var launch = this.imageList.launch;
		
		this.animChargeTube = new  Kinetic.Shape( {
				
				drawFunc : function (){
					var context = this.getContext();
					
					if( this.timer < -60 ){
						
						// apparition engin
						
						var r =  ( ( this.timer + 60 ) / 20 );
						
						
						
						context.drawImage( tube  , -75 + 12 - r * 100 , -150  , 45 , 163.8  ); 
						context.drawImage( pipe  , -75 - r * 100      , 0  , 150 , 180  ); 
						
						
						
						context.drawImage( pistonBras , 256 , 0 , 267 , 264 , -270 + 157.2/4 , -17 + 67 - 100 * r , 157.2/2 , 79.2  ); 
						context.drawImage( pistonCorps  , -305  , 67 - 100 * r , 136.8 , 100  ); 
						
						context.drawImage( clippy  , -130 , 50  ,  41.1 , 78.6  ); 
						
						context.drawImage( bulle  , -230 , 0  ,  103 , 215/2  ); 
						
					}else if( this.timer < -40 ){
						
						// stable
						
						context.drawImage( tube  , -75 + 12  , -150  , 45 , 163.8  ); 
						context.drawImage( pipe  , -75       , 0  , 150 , 180  ); 
						
						
						
						context.drawImage( pistonBras , 256 , 0 , 267 , 264 , -270 + 157.2/4 , -17 + 67 , 157.2/2 , 79.2  ); 
						context.drawImage( pistonCorps  , -305  , 67  , 136.8 , 100  ); 
						
						context.drawImage( clippy  , -130 , 50  ,  41.1 , 78.6  ); 
						
						context.drawImage( bulle  , -230 , 0  ,  103 , 215/2  ); 
						
					}else if( this.timer < - 25 ){
						
						// pousse trombone
						
						var r =  1 + ( ( this.timer + 25 ) / 25 );
						
						var rr = Math.pow( r , 1/2 ) * 90;
					
						
						context.drawImage( tube  , -75 + 12  , -150  , 45 , 163.8  ); 
						
						
						
						if( rr < 30 ){
							context.drawImage( clippy  , -130 , 50  ,  41.1 , 78.6  ); 
							context.drawImage( pipe  , -75       , 0  , 150 , 180  ); 
							context.drawImage( pistonBras , 256  , 0 , 267 , 264 , -270 + 157.2/4 + rr , -17 + 67  , 157.2/2 , 79.2  );
														
						} else {
							context.drawImage( clippy  , -130 + rr - 30, 50  ,  41.1 , 78.6  ); 
							context.drawImage( pipe  , -75       , 0  , 150 , 180  ); 
							context.drawImage( pistonBras ,  -270  + rr  - 157.2/4 , -17 + 67  , 157.2 , 79.2 ); 
							
						}
						context.drawImage( pistonCorps  , -305  , 67  , 136.8 , 100  ); 
						
						context.drawImage( bulle  , -230 , 0  ,  103 , 215/2  ); 
						
					} else if( this.timer < 0 ){
						
						// ferme trappe
						
						var r =  1 + ( ( this.timer  ) / 25 );
						
						context.drawImage( clippy  , -130 + 90 - 30, 50  ,  41.1 , 78.6  ); 
						
						context.drawImage( tube  , -75 + 12  , -150  , 45 , 163.8  ); 
						
						context.beginPath();
						context.rect( -63 , 50 ,  30 , r * 120 );
						context.fillStyle = "#7B7B73";
					    context.fill();
					    context.lineWidth = 2;
					    context.strokeStyle = "black";
						context.stroke();
						
						context.drawImage( pipe  , -75   , 0  , 150 , 180  ); 
						
						context.drawImage( pistonBras ,  -270  + 90  - 157.2/4 , -17 + 67  , 157.2 , 79.2 );
						
						context.drawImage( pistonCorps  , -305  , 67  , 136.8 , 100  ); 
					} else {
						
						// fire
						
						if( 8 <= this.timer && this.timer < 10  )
							context.drawImage( flamme  , -95   , -370  , 96 , 261  );
						
						if( 7 <= this.timer && this.timer < 11  ){
							var r = ( this.timer - 7 ) / 4;
							
							context.drawImage( launch  , -110  , -200 - r * 300  , 208/1.5 , 308/1.5  );
						}
						
						if( this.timer < 8 ){
							context.drawImage( tube  , -75 + 12  , -150  , 45 , 163.8  ); 
						} else if( this.timer < 10 ){
							var r =  ( ( this.timer - 6 ) / 2 );
							var rr = Math.pow( r , 3 );
							context.drawImage( tube  , -75 + 12  , -150 + rr * 40 , 45 , 163.8  ); 
						} else {
							var r =  1 - ( ( this.timer - 10 ) / 15 );
							context.drawImage( tube  , -75 + 12  , -150 +  r * 40 , 45 , 163.8  ); 
						}
						
						context.beginPath();
						context.rect( -63 , 50 ,  30 , 120 );
						context.fillStyle = "#7B7B73";
					    context.fill();
					    context.lineWidth = 2;
					    context.strokeStyle = "black";
						context.stroke();
						
						context.drawImage( pipe  , -75   , 0  , 150 , 180  );
						
						context.drawImage( pistonBras ,  -270  + 90  - 157.2/4 , -17 + 67  , 157.2 , 79.2 );
						
						context.drawImage( pistonCorps  , -305  , 67  , 136.8 , 100  ); 
						
						
					}
					
					this.timer ++ ;
					if( this.timer >= 25 )
						this.timer = 0;
					
				}, 
				x : 950,
				y : 510,
				timer : -80
			} );
			
		
		
		animLayer.add( this.animChargeTube );
		
		this.popBandeau( "Orbital clipBoard Strike" );
		
		new delaiBienPratique( 80 + 10 * 25 , function(){ animLayer.remove( this.animChargeTube ); } , this );
		
		this.blastTab = [];
		this.countStrike = 0;
		
	}
	
	this.orbitalStrike = function( impact ){
		
		var blast = this.imageList.blast;
		var fall = this.imageList.fall;
		
		
		this.blastTab[ "blast"+this.countStrike ] = { timer : 50 , blast : 

			new  Kinetic.Shape( {
				
				drawFunc : function (){
					var context = this.getContext();
					
					// le trombone tombe
					if( this.time < 10 ){
						var r = 1-( this.time / 10 );
						context.drawImage( fall  , -18 + r* 130 , -49 - r*400  , 50 , 78  ); 
					}
					if( this.time == 10 ) context.drawImage( fall , 0 , 0 , 204 , 204  , -18 , -49 , 50 , 50  ); 
					
					if( this.time == 10 ) animateur.startHightTremblement();
					
					// les souffles se propagent
					var pas = 10;
					for( var k = 8 ; k < 3*pas ; k += pas ){
						
						var a = ( this.time - k )/( 50 - k ) ;
						
						//if( a == 0 ) animateur.startHightTremblement();
			
						
						//printOut( "<br>  "+a +"   "+ ( this.time - k ) +"  "+ ( 50 - k ) ); 
						//printOut( "<br>  "+a+"  "+this.time );
						if( a > 0.1 ){
							a = Math.pow( a , 1/2 );
							context.drawImage( blast ,  -100 * a , -100 * a , 200 * a , 200 * a );
						}
					}
					
				},
				x : impact.x,
				y : impact.y,
				time : 0
				
		} )
		
		};
		
		wordLayer.add( this.blastTab[ "blast"+this.countStrike ].blast ); 
		
		
		this.blastTab[ "blast"+this.countStrike ].blast.setAlpha( 1 );
		
		removeFrameListener( this , this.orbitalStrikeMarching );
		addFrameListener( this , this.orbitalStrikeMarching );
		
		this.countStrike ++;
		
	}
	
	
	this.orbitalStrikeMarching = function(  ){
		
		
		var none = true;
		
		
		for( var i in this.blastTab ){
			
			if( this.blastTab[ i ] == null || typeof( this.blastTab[ i ] ) == "undefined" )
				continue;
			
			none = false;
			
			this.blastTab[ i ].timer --;
			this.blastTab[ i ].blast.time ++;
			
			
			//this.blastTab[ i ].x += 20 ;
			
			if( this.blastTab[ i ].timer < 0 ){
				wordLayer.remove( this.blastTab[ i ].blast ); 
				
				this.blastTab[ i ] = null;
				
			}
			
			
		}
		
		if( none )printOut("<br> None" );
		
		if( none )
			removeFrameListener( this , this.orbitalStrikeMarching );
	}
	//tremblement
	
	this.tremble = false;
	this.timerTremble = 0;
	this.startHightTremblement = function(){
		
		if( !this.tremble ){
			addFrameListener( this , this.hightTremblement );
			this.tremble = true;
		}
		this.timerTremble = Math.random()*3 +3;
		
	}
	this.hightTremblement = function( frame ){
		var y = 3 * this.timerTremble * Math.sin( 2*this.timerTremble );
		
		
		wordLayer.y = y
		palLayer.y = y * 0.5;
		
		wordLayer.x = y
		palLayer.x = y *0.5;
		
		if( this.timerTremble < 0 ){
			this.tremble = false;
			removeFrameListener( this , this.hightTremblement );
		}
		this.timerTremble --;
		
	}
	this.startTremblement = function(){
		
		if( !this.tremble ){
			addFrameListener( this , this.tremblement );
			this.tremble = true;
		}
		this.timerTremble = Math.random()*3 + 5;
		
	}
	this.tremblement = function( frame ){
		var y = this.timerTremble * Math.sin( 0.6*this.timerTremble );
		
		
		wordLayer.y = y
		palLayer.y = y * 0.5;
		
		wordLayer.x = y
		palLayer.x = y *0.5;
		
		if( this.timerTremble < 0 ){
			this.tremble = false;
			removeFrameListener( this , this.tremblement );
		}
		this.timerTremble --;
		
	}
	
	//furry
	
	this.furryText;
	this.groupeFurry;
	this.arrowKeyFurry;
	this.arrowBolterFurry;
	this.bangFurry1;
	this.bangFurry2;
	this.startFurySession = function (){
		
		printOut("<br> start fury session ! (" + frappeCoord.furyKey+")");
		
		addFrameListener( this , this.followFurySession );
		
		
		this.groupeFurry = new Kinetic.Group();
		
		this.furryText =  new Kinetic.Text({
                x: -50,
                y: 200,
                text: "",
                fontSize: 50,
                fontFamily: "EatyourfaceRegular",
                textFill: "343232",
                align: "left"
                
            });
		
		
		this.bangFurry1 =  new Kinetic.Image({
               image : this.imageList.bang ,
				width : 600,
				height : 500,
				x : 0,
				y : 0
            });
			
		this.bangFurry2 =  new Kinetic.Image({
               image : this.imageList.bang ,
				width : 450,
				height : 400,
				x : 550,
				y : 30
            });
		
		
		var key =  new Kinetic.Image({
               image : this.imageList.key ,
				width : this.imageList.key.width  * 0.5,
				height : this.imageList.key.height  * 0.5,
				x : 600,
				y : 190
            });
			
		var bolter =  new Kinetic.Image({
               image : this.imageList.bolter ,
				width : this.imageList.bolter.width  * 0.5,
				height : this.imageList.bolter.height  * 0.5,
				x : 850,
				y : 50
            });
			
		var chargeur =  new Kinetic.Image({
               image : this.imageList.chargeur ,
				width : this.imageList.chargeur.width * 0.5,
				height : this.imageList.chargeur.height * 0.5,
				x : 790,
				y : 160
            });
		
		this.arrowKeyFurry =  new Kinetic.Image({
               image : this.imageList.arrow ,
				width : this.imageList.arrow.width * 0.4,
			   height : this.imageList.arrow.height * 0.4,
				x : 705,
				y : 170,
				rotation : Math.PI
            });
			
		this.arrowBolterFurry =  new Kinetic.Image({
               image : this.imageList.arrow ,
			   width : this.imageList.arrow.width * 0.4,
			   height : this.imageList.arrow.height * 0.4,
				x : 810,
				y : 150,
				rotation : Math.PI/3
            });
		
		this.groupeFurry.add( this.bangFurry1 );
		//this.groupeFurry.add( this.bangFurry2 );
		
		this.groupeFurry.add( key );
		this.groupeFurry.add( bolter );
		this.groupeFurry.add( chargeur );
		
		this.groupeFurry.add( this.arrowKeyFurry );
		this.groupeFurry.add( this.arrowBolterFurry );
		
		this.groupeFurry.add( this.furryText );
		
		animLayer.add( this.groupeFurry );
		
		
		removeFrameListener( this , this.marchingAnimFurry );
		addFrameListener( this , this.marchingAnimFurry );
	}
	this.timerMarchingAnimFurry = 0;
	this.marchingAnimFurry = function(){
		
		this.timerMarchingAnimFurry ++;
		
		this.arrowBolterFurry.x = 810 - Math.sin( this.timerMarchingAnimFurry * 0.2 ) * 3 * 10;
		this.arrowBolterFurry.y = 150 +  Math.sin( this.timerMarchingAnimFurry * 0.2 ) * 2 * 10;
		
		this.arrowKeyFurry.y = 170 - Math.sin( this.timerMarchingAnimFurry * 0.2 + Math.PI ) * 3 * 10;
		
		this.furryText.y = 200 +  Math.sin( this.timerMarchingAnimFurry * 0.4 ) * 6;
		this.furryText.x = 0 +  Math.sin( this.timerMarchingAnimFurry * 0.3 ) * 5;
		
		
		
		this.bangFurry1.y = 0 +   Math.sin( this.timerMarchingAnimFurry * 0.42 ) * 6;
		
		this.bangFurry2.y = 30 +  Math.sin( this.timerMarchingAnimFurry * 0.35 ) * 5;
		
		if( Math.random() > 0.95 )
			this.timerMarchingAnimFurry = 0;
	}
	this.rem_affich;
	this.followFurySession = function(){
		
		var r = "";
		
		this.rem_affich = frappeCoord.hitRemaining;
		
		for( var i = 0 ; i < this.rem_affich ; i ++ ){
			//if( i % 5 == 0 ) r += " ";
			r += frappeCoord.furyKey;
		}
		this.furryText.text = " RELOAD, press \""+r+"\"";
	}
	this.stopFurySession = function (){
		
		removeFrameListener( this , this.marchingAnimFurry );
		
		printOut("<br> fin fury session");
		
		removeFrameListener( this , this.followFurySession );
		
		animLayer.remove( this.groupeFurry );
		
		this.groupeFurry = null;
	}
	this.swapMode = function( mode ){
		
	}
	
	// pop end
	this.popEnd = function( ){
		
		var bang = new Kinetic.Image( {
			image : this.imageList.bang ,
			width : 600,
			height : 1200,
			x : 200 , 
			y : -200
		} );
		
		var skull = this.imageList.motifSkull;
		
		var kill = engine.nombreMot - missTable.length;
		
		var texte = new Kinetic.Shape( {
			drawFunc : function(){
				
				var context = this.getContext();
				
				context.font = "30pt EatyourfaceRegular";
				context.fillStyle = "#343232";
				context.fillText("Score : ", 0, 0);
				context.fillText("(    x "+kill+" ) ", 0, 50);
				
				context.drawImage( skull , 30 , 20 , 30 , 30 );
				
				
			},
			
			x : 300,
			y : 100
		} );
		
		var scrollPane = new Kinetic.Shape( {
			drawFunc : function(){
				
				var context = this.getContext();
				
				context.font = "30pt EatyourfaceRegular";
				context.fillStyle = "#343232";
				
				var skull_par_ligne = 9;
				
				for( var x = 0 ; x < Math.min( Math.floor( kill / skull_par_ligne ) +1 , 8 ) ; x ++ )
					for( var y = 0 ; y < ( (x != Math.floor( kill / skull_par_ligne ) )?( skull_par_ligne ):( kill % skull_par_ligne ) ) ; y ++ )
						context.drawImage( skull , 20 + y * 40 , x * 40 , 30 , 30 );
						
				if( kill > 8 * skull_par_ligne )
					context.fillText("[ ... ]", 50, 350 );
			},
			
			x : 300,
			y : 180
			
			
			
		} );
			
		
		var playAgain = new Kinetic.Text({
                x: 550 ,
                y: 600,
                text: "Play Again",
                fontSize: 20,
                fontFamily: "EatyourfaceRegular",
                textFill: "#343232",
                align: "center",
                verticalAlign: "middle"
            });
		
		
		var correction = new Kinetic.Text({
                x: 360 ,
                y: 600,
                text: "Correct",
                fontSize: 20,
                fontFamily: "EatyourfaceRegular",
                textFill: "#343232",
                align: "center",
                verticalAlign: "middle"
            });
		
		
		
		
		correction.on("mousedown", function() {
			// on modifie le comportement de texte
			
			animLayer.remove( scrollPane );
			
			scrollPane = new Kinetic.Group();
			
			for( var i = 0 ; i < missTable.length ; i ++ ){
				var text = new Kinetic.Text({
					x: 0 ,
					y: i * 20,
					text: missTable[ i ].fals,
					fontSize: 18,
					fontFamily: "EatyourfaceRegular",
					textFill: "#343232",
					align: "left",
					verticalAlign: "middle",
					fals : missTable[ i ].fals,
					correct : missTable[ i ].correct,
				});
				
				
				text.on("mousedown", function( e ) {
				
					if( this.text == this.fals ){
						this.text = this.correct;
						this.fontSize = 12;
					}else{
						this.text = this.fals;
						this.fontSize = 18;
					}
				});
				
				scrollPane.add( text );
			}
			
			animLayer.add( scrollPane );
			scrollPane.x = 300;
			scrollPane.y = 180;
			
			/*
			scrollPane.drawFunc =  function(){
					
					var context = this.getContext();
					
					context.font = "15pt EatyourfaceRegular";
					context.fillStyle = "#343232";
					
					for( var i = 0 ; i < missTable.length ; i ++ )
						context.fillText( missTable[ i ].fals + " -> "  + missTable[ i ].correct , 0, i*16);
					
			}*/
			animLayer.remove( correction );
		});
		correction.on("mouseover", function() {
			document.body.style.cursor = "pointer";
		});
		correction.on("mouseout", function() {
			document.body.style.cursor = "default";
		});
		
		var tabMessage = [ "you dont want to do that" , "just .. just dont" , "stop pressing that button ok?" , "ok , I didnt set up the restart mode" , "and so? just press F5 ffs!" , "oh you think its funny?"  ];
		var i_mess = 0;
		playAgain.on("mousedown", function() {
			// on detruit tout
			/*
			stage.removeChildren();
			stage.onFrame( function(){} );
			listener = [];
			
			wordLayer = null;
			palLayer = null;
			animLayer = null;
			lowLayer = null;
			surfaceLayer = null;
			*/
			// on lance un nouveau jeu
			//var a = new procedure( stage );
			
			alert( tabMessage[ i_mess ] );
			i_mess++ ;
			if(  i_mess == tabMessage.length ){
				animLayer.remove( playAgain );
				
				new delaiBienPratique( 50 , function(){ alert( " ahah what are you gonna do now ?" ); } , this );
			}
		});
		playAgain.on("mouseover", function() {
			document.body.style.cursor = "pointer";
		});
		playAgain.on("mouseout", function() {
			document.body.style.cursor = "default";
		});
		
		animLayer.removeChildren();
		animLayer.add( bang );
		animLayer.add( texte );
		animLayer.add( scrollPane );
		animLayer.add( playAgain );
		animLayer.add( correction );
		animLayer.draw();
		
	}
	
	//smash
	
	this.groupSmashMode;
	this.bangSmash;
	this.smashText;
	this.keyboardSmash;
	this.animSmashMode;
	this.startSmashMode = function(){
		
		this.smashText =  new Kinetic.Text({
                x: 100,
                y: 200,
                text: "Face Roll !",
                fontSize: 50,
                fontFamily: "EatyourfaceRegular",
                textFill: "343232",
                align: "left"
                
            });
		
		
		this.bangSmash =  new Kinetic.Image({
               image : this.imageList.bang ,
				width : 400,
				height : 200,
				x : 100,
				y : 130
            });
		
		this.keyboardSmash =  new Kinetic.Image({
               image : this.imageList.keyboard ,
				width : this.imageList.keyboard.width * 0.5,
				height : this.imageList.keyboard.height * 0.5,
				x : 350,
				y : 300
            });
		
		this.animSmashMode = new  Kinetic.Shape( {
			
				drawFunc : function (){
					
					var context = this.getContext();
					
					animateur.imageList.roll
					
					var l = Math.floor( this.timer / 5 );
					
					if( l >= animateur.imageList.roll.length ){
						this.timer = 0;
						l = 0;
					}
					
					context.drawImage( animateur.imageList.roll[ l ] , 0 , 0 , animateur.imageList.roll[ l ].width*0.28  , animateur.imageList.roll[ l ].height*0.28  ); 
					
				},
				timer :0,
				x : 300,
				y : 100
		} );
		
		this.groupeSmash = new Kinetic.Group();
		
		this.groupeSmash.add( this.bangSmash );
		this.groupeSmash.add( this.smashText );
		this.groupeSmash.add( this.keyboardSmash );
		this.groupeSmash.add( this.animSmashMode );
		
		animLayer.add( this.groupeSmash );
		
		this.popBandeau( "Face Roll Mode ! ");
		
		addFrameListener( this , this.marchingAnimSmashMode );
	}
	this.timerMarchingAnimSmash = 0;
	this.marchingAnimSmashMode = function(){
		
		this.timerMarchingAnimSmash ++;
		
		this.smashText.y = 200 + Math.sin( this.timerMarchingAnimSmash *0.3 ) * 5 ;
		this.smashText.x = 200 + Math.sin( this.timerMarchingAnimSmash *0.26 ) * 4 ;
		
		this.bangSmash.y = 130 + Math.sin( this.timerMarchingAnimSmash *0.2 ) * 5 ;
		this.bangSmash.x = 100 + Math.sin( this.timerMarchingAnimSmash *0.38 ) * 6 ;
		
		this.keyboardSmash.y = 100 + Math.sin( this.timerMarchingAnimSmash *0.4 ) * 5 ;
		//this.keyboardSmash.x = 350 + Math.sin( this.timerMarchingAnimSmash *0.1 ) * 6 ;
		
		this.animSmashMode.timer ++;
		
		if( Math.random() > 0.95 )
			this.timerMarchingAnimSmash = 0;
	}
	this.stopSmashMode = function(){
	
		animLayer.remove( this.groupeSmash );
		
		this.groupeSmash = null;
		
		removeFrameListener( this , this.marchingAnimSmashMode );
	}
	
	// generique
	
	this.popBandeauLevel = -1;
	this.popBandeau = function( texte ){
		this.popBandeauLevel ++;
		animLayer.add( bangAnnouncement = new  Kinetic.Shape( {
				x : -300,
				y : 150 ,
				drawFunc : function (){
					var context = this.getContext();
					
					context.drawImage( animateur.imageList.bang , Math.sin( this.timer * 0.3 ) *3 , Math.sin( this.timer * 0.35 )   , 450 , 200  ); 
					
					
					context.fillStyle = "#343232";
					context.font = "40pt EatyourfaceRegular";
					context.fillText(texte, 0 + Math.sin( this.timer * 0.2  ) *4 , 100 + Math.sin( this.timer * 0.23 ) *3 );
					
					this.timer ++;
					
					this.x += ( Math.abs( ( this.x - 420 ) )+50 )/20
					
					
					if( this.x > 800 ){
						animateur.popBandeauLevel --;
						animLayer.remove( this );
					}
				},
				timer : 0,
				y : this.popBandeauLevel * 90
			})
		);
		
	}
			
		
}


	
function Engine( ) {
	
	var wordStock = [];
	
	this.wordStock = wordStock;
	
	this.bibliotheque = new Bibliotheque();
	
	var bibliotheque = this.bibliotheque;
	
	this.nombreMot = bibliotheque.books.easy.length;
	
	// smash mode
	this.isSmashMode = false;
	this.smashTimer = 0;
	this.reloadSmash = -1;
	this.smashButton = function(){
		
		if( this.isSmashMode ) return;
		
		if( this.reloadSmash  < 0 ){
			// on a le droit de lancer le bonus
			this.startSmashMode();
			
			this.reloadSmash = option.reloadSmash;
			
		} else if( this.reloadSmash == 1 ){
			
			// on viens de tiquer sur le dernier reload, on attend quelque temps, on le positionne sur pret et on le dit à l'animateur
			
			this.reloadSmash --;
			
			new delaiBienPratique( 250 , function(){ this.reloadSmash = -1 ; animateur.updateCoolDownBonus(); animateur.popBandeau( "Smash Mode READY" ); } , this );
			
		} else if( this.reloadSmash != 0 ){
			
			// on tic un reload
			
			this.reloadSmash --;
			
		}
		
		animateur.updateCoolDownBonus();
		
	}
	this.startSmashMode = function(){
		
		this.isSmashMode = true;
		
		this.smashTimer = option.dureSmash;
		
		removeFrameListener( this , this.marchingSmashMode );
		addFrameListener( this , this.marchingSmashMode );
		
		frappeCoord.swapMode( "IgnoreMatch" );
		
		// on previent l'animateur
		animateur.startSmashMode();
	}
	this.marchingSmashMode = function(){
		
		this.smashTimer --;
		
		if( this.smashTimer <= 0){
			
			removeFrameListener( this , this.marchingSmashMode );
			
			frappeCoord.swapMode( "Regular" );
			
			this.isSmashMode = false;
			
			animateur.updateCoolDownBonus();
			
			// on previent l'animateur
			animateur.stopSmashMode();
		}
	}
	
	
	// orbital strike
	this.reloadStrike = -1;
	this.isStrikeMode = false;
	this.timerOrbitalStrike = 0;
	this.countOrbitalStrike = 0;
	
	this.orbitalButton = function(){
	
		if( this.isStrikeMode ) return;
		
		if( this.reloadStrike  < 0 ){
			// on a le droit de lancer le bonus
			this.startPaperClipOrbitalStrike();
			
			this.reloadStrike = option.reloadStrike;
			
		} else if( this.reloadStrike == 1 ){
			
			// on viens de tiquer sur le dernier reload, on attend quelque temps, on le positionne sur pret et on le dit à l'animateur
			this.reloadStrike --;
			
			new delaiBienPratique( 250 , function(){ this.reloadStrike = -1 ; animateur.updateCoolDownBonus(); animateur.popBandeau( "Orbital Strike READY" ); } , this );
			
		} else if( this.reloadStrike != 0 ){
			
			// on tic un reload
			
			this.reloadStrike --;
			
		}
		
		animateur.updateCoolDownBonus();
		
	}	
	this.startPaperClipOrbitalStrike = function(){
		this.isStrikeMode = true;
		
		this.timerOrbitalStrike = Math.floor( Math.random() * 1  + 80 ) ;
		this.countOrbitalStrike = 10;
		
		removeFrameListener( this , this.orbitalStrike );
		addFrameListener( this , this.orbitalStrike );
		
		// on prévient l'animateur
		animateur.preOrbitalStrike(  );
		animateur.updateCoolDownBonus();
	}
	this.orbitalStrike = function( frame ){
		
		var impact_radius = 100;
		
		
		if( this.timerOrbitalStrike < 0 ){
			
			var impact = new Point( ( 0.15 + Math.random()*0.7 ) * option.worldDim.x , ( 0.15 + Math.random()*0.7 ) * option.worldDim.y );
			
			for( var i = 0 ; i < wordStock.length ; i ++  ){
				
				var tmp = OpP.sub( wordStock[i].pos , impact );
				
				var distance = OpP.scalaire( tmp , tmp  );
				
				if( distance < impact_radius * impact_radius )
					new delaiBienPratique( 30 , wordStock[i].popSurlignage , wordStock[i] );
				
			}
			
			// on prévient l'animateur
			animateur.orbitalStrike( impact );
			
			this.countOrbitalStrike --;
			
			if( this.countOrbitalStrike <= 0 ){
				removeFrameListener( this , this.orbitalStrike );
				this.isStrikeMode = false;
				
				printOut("<br>  end of " + this.isStrikeMode);
				
				animateur.updateCoolDownBonus();
				
				
			}
			
			this.timerOrbitalStrike = Math.floor( Math.random() * 10  + 30 ) ;
			
		}
		this.timerOrbitalStrike --;
	}
	
	this.emptyBiblio = false;
	this.ajoutWord = function(){
			
			try{
				var key = bibliotheque.getWord( "easy" );
			}catch( e ){
				this.emptyBiblio = true;
				return;
			}
			
			var p;
			
			if( (p = getAcceptablePosition()) == null )
				return;
			
			wordStock.push( new MecaniqueWord( key.correct , key.faux , p ) );
			
			
			frappeCoord.candidat.push( wordStock[ wordStock.length -1 ] );
			
			function getAcceptablePosition(){
				
				var l = 0;
				while( l < 10 ){
					
					var p = getOutScreenStartPosition();
					
					var flag = true;
					
					for( var i in wordStock ){
						
						var posp = OpP.sub( wordStock[ i ].pos , p );
						
						var d = OpP.scalaire( posp , posp );
						
						if( d < 50*50 ){
							flag = false;
							break;
						}
					}
					if( flag ) 
						return p;
					
					l++;
				}
				return null;
			}
			
			// projection d'un angle random sur les bord du word
			function getOutScreenStartPosition(){
				
				var seed = Math.random();
				
				var bordx = 70;
				var bordy = 20;
				
				//return new Point( 400 , 100 );
				
				if( seed < 0.25 )
					return new Point( 10 , Math.random() * ( option.worldDim.y - bordy ) + bordy );
				if( seed < 0.5 )
					return new Point( Math.random() * ( option.worldDim.x - bordx ) + bordx , bordy  );
				if( seed < 0.75 )
					return new Point( option.worldDim.x - bordx , Math.random() * ( option.worldDim.y - bordy ) + bordy  );
				
				return new Point(  Math.random() * ( option.worldDim.x - bordx ) + bordx , option.worldDim.y - bordy  );
				
				
				
				var p = new Point( Math.cos( seed * 3.1415 ) , Math.sin( seed * 3.1415 ) );
				
				var dx = ( p.x > 0 )?( option.worldDim.x - world.bastion.x ):( - world.bastion.x );
				var dy = ( p.y > 0 )?( option.worldDim.y - world.bastion.y ):( - world.bastion.y );
				
				var l = Math.min( dx * p.x , dy* p.y );
				
				return new Point( p.x * l , p.y * l );
			}
			
	}
	
	this.end = function (){
		
		printOut( "end ");
		
		// on desactive tout
		new delaiBienPratique( 20 , function(){
			listener = [];
			
		}
		, this );
		
		this.cycle = function(){};
		
		// on lance la dernière animation
		animateur.popEnd();
		
		
	}
	this.timer_spawn = 0;
	this.cycle = function( frame ){
			
			// faire avancer les word
			for( var i = 0 ; i < wordStock.length ; i ++  )
				wordStock[i].walk( frame );
			
			
			//faire spawn des nouveaux word
			if( this.timer_spawn <= 0 && wordStock.length < option.spawn_limit ){
			
				this.ajoutWord();
				
				this.timer_spawn = ( Math.random() + 0.5 )*option.spawn_delay;
			}
			this.timer_spawn --;
			
			// detecteur de fin
			if( this.emptyBiblio && wordStock.length == 0 )
				this.end();
		}
		
	this.oneLifeLost = function(){
		
		
	}
	
}


var key_tab = { 65 : "a" , 
				66 : "b" , 
				67 : "c" , 
				68 : "d" , 
				69 : "e" , 
				70 : "f" , 
				71 : "g" , 
				72 : "h" , 
				73 : "i" , 
				74 : "j" , 
				75 : "k" , 
				76 : "l" , 
				77 : "m" , 
				78 : "n" , 
				79 : "o" , 
				80 : "p" , 
				81 : "q" , 
				82 : "r" , 
				83 : "s" , 
				84 : "t" , 
				85 : "u" , 
				86 : "v" , 
				87 : "w" , 
				88 : "x" , 
				89 : "y" , 
				90 : "z" ,
				32 : " " ,
				161 : "!",
				223 : "!",
				170 : "*",
				220 : "*"
			};

var ecouteurClavier = function( event ){
	
	try {
		
		
		
		if( event.keyCode == 32 || ( 65 <= event.keyCode && event.keyCode <= 90 ) ){
			frappeCoord.accepteChar( key_tab[ event.keyCode ] );
			return;
		}
		
		if( event.keyCode == 8 ){
			frappeCoord.backwardChar(  );
			//we dont want to go to the previous page
			event.cancelBubble = true
			event.stopPropagation();
			event.preventDefault();
			return false;
		}
		
		
		
	}catch( e ){

		catchError( e );
	}
	//for( var p in event ) alert( p+" : "+event[p] );
}

// on ecoute le up, c'est le seul event qui ne se repete pas lorsqu'on laisse la touche enfoncée
var ecouteurClavierNoRepeat = function( event ){
	
	try {
		if( event.keyCode == 97 || event.keyCode == 49 ){
			//engine.startPaperClipOrbitalStrike(  );
			engine.orbitalButton();
			return;
		}
		if( event.keyCode == 98 || event.keyCode == 50 ){
			engine.smashButton();
			//engine.startSmashMode(  );
			return;
		}
		if( key_tab[ event.keyCode ] && frappeCoord.furySession ){
			frappeCoord.accepteChar( key_tab[ event.keyCode ] );
			return;
		}
		
	}catch( e ){

		catchError( e );
	}
	//for( var p in event ) alert( p+" : "+event[p] );
}




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


/* appel */


animateur = new Animateur();

engine = new Engine();

animateur.updateCoolDownBonus();
	

frappeCoord = new FrappeCoordinator();

var paladin = new AffichablePaladin();

var missTable = [];


// fps limiter
var fps_limite = 60;
var timer_fps_limiter = 0;

var timerFpsDiff =0;
var timerFps=0;
var averageFps =0;
	
var fps_panel = new Kinetic.Text({
	x:50,
    y:10,
    text: "",
    fontSize: 10,
	fontFamily: "Impact",
    textFill: "343232",
    align: "right",
    verticalAlign: "middle"
} );
fpsLayer.add( fps_panel );

stage.onFrame(function(frame){
  
	try{
		// limiteur de fps
		timerFpsDiff += Math.min( frame.timeDiff , 1000 ); // on fait un min parceque quand on lache le focus, on a pas de frame, le tieDiff devient enorme quand on revient
		timer_fps_limiter += Math.min( frame.timeDiff , 1000 ); 
		if( timer_fps_limiter < 1000/fps_limite )
			return;
		
		timer_fps_limiter -= 1000/fps_limite;
		
		// fps counter
		if( frame.timeDiff > 0 ) averageFps = ( timerFps * averageFps + ( 1/timerFpsDiff *1000) ) / ( timerFps +1 );
		if( timerFps >= 15 ){
			fps_panel.text = Math.round( averageFps ) +" fps "  ;
			fpsLayer.draw();
			timerFps = 0;
		}
		
		timerFps ++;
		
		engine.cycle( { timeDiff : timerFpsDiff } );
		
		for( var i in listener )
			listener[ i ].func.call( listener[ i ].objet , { timeDiff : timerFpsDiff } );
		
		
		
		wordLayer.draw();
		animLayer.draw();
		palLayer.draw();
		
		timerFpsDiff = 0;
		
	}catch( e ){

		catchError( e );
	}
});


document.onkeyup = ecouteurClavierNoRepeat;
document.onkeydown = ecouteurClavier;

// on prévoit la prochaine recharge

var appel = this;
var declencheReloadMode = function(){
	
	if( !frappeCoord.furySession )
		frappeCoord.startFurySession();
	
	new delaiBienPratique( ( Math.random() + 1 ) * option.reloadTime  , declencheReloadMode , appel );
}


fullyLoadedImage = function(){  
	stage.start(); 
	new delaiBienPratique( ( Math.random() + 1 ) * option.reloadTime  , declencheReloadMode , appel );
	lowLayer.draw();
} ;




}

