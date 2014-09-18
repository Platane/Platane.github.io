
var OpPol = {};

OpPol.split = function( poly ,i , j  ){
	
	
	var invFlag = false;
	if( i  > j  ) {
		var tmp = i;
		i=j;
		j=tmp;
		invFlag  = true;
	}
	
	var i_c = i%1;
	var j_c = j%1;
	
	i = Math.floor( i );
	j = Math.floor( j );
	
	var A = [];
	var B = [];
	
	
	var partA1;
	var partB1;
	
	var partA2;
	var partB2;
	
	for( var k = 0 ; k<  poly.length ; k ++){
		
		
		if( i<k && k<j ){
			A.push( poly[k] );
		}
		if( k<i || j<k ){
			B.push( poly[k] );
		}
		if( i == k ){
			
			partA1 = A.length;
			partB1 = B.length;
			
			B.push( poly[k] );
			if( i_c != 0 ){
				
				var e = barycentre( poly[k] , poly[ (k+1)%poly.length ]  , 1-i_c )
				
				A.push( e );
				B.push( e );
			}else{
				A.push( poly[k] );
			}
		}
		if( j == k ){
		
			partA2 = A.length;
			partB2 = B.length;
			
			if( i != j ) A.push( poly[k] );
			if( j_c != 0 ){
				
				var e = barycentre( poly[k] , poly[ (k+1)%poly.length ]  , 1-j_c )
				
				A.push( e );
				B.push( e );
			}else{
				B.push( poly[k] );
			}
		}
	}
	
	
	if( invFlag ){
		var tmp= partA2;
		partA2 = partA1;
		partA1 = tmp;
		
		tmp= partB2;
		partB2 = partB1;
		partB1 = tmp;
	}
	
	return { A:A , B:B , partA2:partA2 , partB2:partB2 , partA1:partA1 , partB1:partB1};
	
	function barycentre( a_de_barycentre , b_de_barycentre  , alpha ){
		return OpP.add( OpP.scal( a_de_barycentre , alpha ) , OpP.scal( b_de_barycentre , 1-alpha ) );
	}
}

OpPol.go_triangle = function ( poly ){
	
	// on a la demonstration de ce qui suit sur un papier qui traine, ya un diagramme de sequence avec il me semble
	
	var tab = this.go_convex( poly );
	
	var tabTriangle = [];
	
	for( var i = 0 ; i < tab.length ; i++ ){
		
		for( var k = 2 ; k < tab[i].length ; k ++ ){
			
			var poly = [ tab[i][0] , tab[i][k-1] , tab[i][k] ];
			
			tabTriangle.push( poly );
		}
	}
	
	return tabTriangle;
}
OpPol.centreMasse = function ( poly ){
	
	var tab = this.go_triangle( poly );
	
	var pond = 0;
	
	var Gm = new Point(0,0,0);
	
	for( var i = 0 ; i < tab.length ; i++ ){
		
		
		var g = new Point(0,0,0);
		
		for( var k = 0 ; k < tab[ i ].length ; k ++ ){
			
			g = OpP.add( g , tab[ i ][ k ] );
		}
		
		g = OpP.scal( g , 1/tab[ i ].length );
		
		
		var aire = this.aire( tab[ i ] );
		
		Gm = OpP.add( Gm , OpP.scal( g , aire ) );
		
		pond += aire;
		
	}
	
	return OpP.scal( Gm , 1/pond );
	
}
OpPol.aire = function( poly ){
	
	if( poly.length < 3 ) return 0;
	
	var p_list = this.go_convex( poly , 5 );
	
	var sum = 0;
	
	for( var l = 0 ; l < p_list.length ; l ++ ){
		
		for( var k = 1 ; k<  p_list[l].length-1 ; k ++){
			
			sum += aireTrapeze( OpP.sub( p_list[l][k+1] , p_list[l][0] ) , OpP.sub( p_list[l][k] , p_list[l][0] ) );
		
		}
	}
	return sum/2;
	
	
	// a et b les cotée
	function aireTrapeze( a ,b ){
		
		return OpP.norme( OpP.det( a , b ) );
		
	}
}

OpPol.permutation_circulaire = function( poly , k ){
	
	for( var i = 0 ; i < k ; i ++ ){
		
		poly.push( poly[0] );
		
		poly.splice( 0 , 1 );
	}
	
	return poly;
}
	
OpPol.go_convex = function( poly , rec ){
	
	if( rec == null ) rec = 20;
	
	
	
	//if( rec <= 0 ) return new Array();
	
	var p = pointPasConvexe( poly )%poly.length ;
	
	
	
	if( p == -1 )return  new Array( poly.concat( [] ) );
	
	var k = 2;
	
	do{
	
		var rep = this.split( poly , p , (p+k)%poly.length  );
		
		var acceptable
		
		
		acceptable = isConvexe( rep.A , rep.partA1 ) && isConvexe( rep.B , rep.partB1 );
		
		
		if( !OpP.equals( poly[p] , rep.A[ rep.partA1 ] )   || !OpP.equals( poly[p] , rep.B[ rep.partB1 ] ) ){
		
			throw "oh tu te souviens tu truc que t'as pas pris la peine de verifier, bah fun fact il marche pas \n p < (p+k)%poly.length  "+(p < (p+k)%poly.length) ;
			
			printOut( "<br> p  "+PString( poly[p] )  );
			printOut( "<br> A  "+PString( rep.A[ rep.partA1 ] )  );
			printOut( "<br> B  "+PString( rep.B[ rep.partB1 ] )  );
			
			
			printOut( "<br> A  "+this.toString( rep.A ) );
			printOut( "<br> B  "+this.toString( rep.B ) );
		}
		
		
		
		k++;
		
	} while( k < poly.length -2 && !acceptable );
	
	
	//return ( [rep.A] ).concat( [ rep.B ] );
	
	
	return this.go_convex( rep.A , rec-1).concat( this.go_convex( rep.B , rec-1) );
	//return new Array( rep.A , rep.B  );
	
	function pointPasConvexe( poly ){
		
		// on calcul dans quel sens tourne le poly,
		// on fait l'hypothèse ( qui est probablement vraie  ) que pour tout polygone convexe ou pas, on a une majorité de "point convexe"
		
		
		// on calcul le det et on regarde son sens, pour faire simple on va en prendre un pour reference et regarder le signe du scalaire avec les autres
		var sensTab = [];
		
		var AC = OpP.sub( poly[ 0 ] , poly[ 1  ] );
			
		var AB = OpP.sub( poly[ 1 ] , poly[ 2 ] );
			
		var ref_n = OpP.det( AC , AB );
		
		var n=0;
		
		for( var k = 1 ; k<  poly.length +1 ; k ++){
			
			AC = OpP.sub( poly[ (k-1)%poly.length ] , poly[ (k+1)%poly.length  ] );
			
			AB = OpP.sub( poly[ k%poly.length ] , poly[ (k+1)%poly.length ] );
			
			
			var sens = ( OpP.scalaire( OpP.det( AC , AB ) , ref_n ) > 0 );
			
			n += ( sens?( 1 ):( -1 ) );
			
			sensTab[k%poly.length]  = sens;
			
		}
		
		if( Math.abs( n ) == poly.length ) return -1;
		
		var dedans = ( n > 0 );
		
		for( var k = 0 ; k < sensTab.length ; k ++ ){
			
			if( sensTab[k] != dedans ) return k;
		}
		
		return -1;
	}
	
	// return true si le point est convexe
	function isConvexe( poly , f ){
		
		// on calcul dans quel sens tourne le poly,
		// on fait l'hypothèse ( qui est probablement vraie  ) que pour tout polygone convexe ou pas, on a une majorité de "point convexe"
		
		
		var sensTab = [];
		
		var AC = OpP.sub( poly[ 0 ] , poly[ 1  ] );
			
		var AB = OpP.sub( poly[ 1 ] , poly[ 2 ] );
			
		var ref_n = OpP.det( AC , AB );
		
		var n=0;
		
		for( var k = 1 ; k<  poly.length +1 ; k ++){
			
			AC = OpP.sub( poly[ (k-1)%poly.length ] , poly[ (k+1)%poly.length  ] );
			
			AB = OpP.sub( poly[ k%poly.length ] , poly[ (k+1)%poly.length ] );
			
			
			var sens = ( OpP.scalaire( OpP.det( AC , AB ) , ref_n ) > 0 );
			
			n += ( sens?( 1 ):( -1 ) );
			
			sensTab[k%poly.length]  = sens;
			
		}
		
		if( Math.abs( n ) == poly.length ) return true;
		
		var dedans = ( n > 0 );
		
		return ( sensTab[f] == dedans );
		
	}
	
}

OpPol.toString = function( poly  ){
	var rep = "";
	for( var i = 0 ; i < poly.length ; i ++ ){
		rep+= "  - " + PString( poly[i] ) + " <br>";
	}
	return rep;
}

OpPol.toStringJs = function ( poly ){

	var rep = "["
	for( var k = 0 ; k < poly.length ; k ++  ){
		rep+= "<br>new Point( "+poly[k].x +" , "+poly[k].y +" , "+poly[k].z+" ) " ;
		if( k < poly.length-1 ) rep+= " ,";
	}
	rep += " ] ";
	
	return rep;
}
// solidement testé moais , mais il c'est un coquinou
// en 2D
//p1 , p2 deux tableau de points, les points ne doivent pas forcement etre dans un ordre specifique, on va detecter au debut quel sens est l'interieur
// attention au effets de bord 
// dans un cas, on renvoit le polygone directement
OpPol.intersectionPolygone = function( p1 , p2 ){
		
		try{
		
		function sens( e1 , e2 , poin ){
			
			 return ( OpP.det( OpP.sub( e2 , e1  ), OpP.sub( poin , e1  ) ) > 0 );
		}
		
		
		/*
		p1 = p1.reverse();
		p2 = p2.reverse();
		*/
		
		// operateur de point
		var OpP = OpP2D;
		
		// les polyones sont convexes
		var sens1 = sens( p1[0] , p1[1] , p1[2] );
		var sens2 = sens( p2[0] , p2[1] , p2[2] );
		
		
		var intersectionList = [];
		
		var tolerance = 0.000001;
		
		var sous_tolerance = 0.001;
		
		// il faut deja trouver une intersection
		for( var i = 0 ; i < p1.length ; i ++ ){
			for( var j = 0 ; j < p2.length ; j ++ ){
				
				//var rep = OpP.intersectionSegment( p1[ i ] , p1[ ( i+ 1) % p1.length ] , p2[ j ] , p2[ ( j+ 1) % p2.length ] );
				var rep = OpP.intersectionSegmentPlus( p1[ i ] , p1[ ( i+ 1 ) % p1.length ] , p2[ j ] , p2[ ( j+ 1 ) % p2.length ] );
				
				if( rep.c ){
				
					var incorpore = true;
					
					// detection de coin
					if( rep.ta < tolerance  ){
						// coin sur le A ( peu etre )
						
						// on va tester si il est interieur a l'autre figure
						// en testant les point un peu excentrer plus loin,
						var A = OpP.add( OpP.scal( p1[ (i-1+p1.length)% p1.length ] , sous_tolerance ) , OpP.scal( p1[ i ] , 1-sous_tolerance ) );
						var B = OpP.add( OpP.scal( p1[ i ] , 1-sous_tolerance ) , OpP.scal( p1[ ( i+ 1 ) % p1.length ] , sous_tolerance ) );
						
						if( sens( p2[ j ] , p2[ ( j+ 1 ) % p2.length ] , A ) == sens( p2[ j ] , p2[ ( j+ 1 ) % p2.length ] , B ) ) incorpore = false;
					}
					if( rep.ta > 1-tolerance  ){
						var A = OpP.add( OpP.scal( p1[ ( i+ 1 ) % p1.length ] , 1-sous_tolerance ) , OpP.scal( p1[ i ] , sous_tolerance ) );
						var B = OpP.add( OpP.scal( p1[ ( i+ 2 ) % p1.length ] , sous_tolerance ) , OpP.scal( p1[ ( i+ 1 ) % p1.length ] , 1-sous_tolerance ) );
						
						if( sens( p2[ j ] , p2[ ( j+ 1 ) % p2.length ] , A ) == sens( p2[ j ] , p2[ ( j+ 1 ) % p2.length ] , B ) ) incorpore = false;
					}
					if( rep.tb < tolerance  ){
						var A = OpP.add( OpP.scal( p2[ (j-1+p2.length)% p2.length ] , sous_tolerance ) , OpP.scal( p2[ j ] , 1-sous_tolerance ) );
						var B = OpP.add( OpP.scal( p2[ j ] , 1-sous_tolerance ) , OpP.scal( p2[ ( j+ 1 ) % p2.length ] , sous_tolerance ) );
						
						if( sens( p1[ i ] , p1[ ( i+ 1 ) % p1.length ] , A ) == sens( p1[ i ] , p1[ ( i+ 1 ) % p1.length ] , B ) ) incorpore = false;
					}
					if( rep.tb > 1-tolerance  ){
						var A = OpP.add( OpP.scal( p2[ ( j+ 1 ) % p2.length ] , 1-sous_tolerance ) , OpP.scal( p2[ j ] , sous_tolerance ) );
						var B = OpP.add( OpP.scal( p2[ ( j+ 2 ) % p2.length ] , sous_tolerance ) , OpP.scal( p2[ ( j+ 1 ) % p2.length ] , 1-sous_tolerance ) );
						
						if( sens( p1[ i ] , p1[ ( i+ 1 ) % p1.length ] , A ) == sens( p1[ i ] , p1[ ( i+ 1 ) % p1.length ] , B ) ) incorpore = false;
					}
					
					var li = { M:rep.M , isharp : [ ( i + rep.ta ) % p1.length , ( j + rep.tb ) % p2.length] , i : [i , j] }
					
					for( var k = 0 ; k < intersectionList.length ; k ++ ){
						if( 	Math.abs( intersectionList[ k ].isharp[0] - li.isharp[0] ) < tolerance
							||	Math.abs( intersectionList[ k ].isharp[1] - li.isharp[1] ) < tolerance
						){
							//intersectionList.splice( k , 1 );
							incorpore = false;
						}
					}
					
					if( incorpore ) intersectionList.push( li );
				}	
			}
		}
		/*
		printOut("<br>  dans cela "+intersectionList.length);
		
		for( var i = 0 ; i < intersectionList.length ; i ++ ){
			
			var p = intersectionList[i].M
			context.beginPath();
			context.arc( p.x , p.y , 3 , 0, Math.PI*2 , false );
			context.closePath();
			
			context.strokeStyle = "rgb(0,0,0)";
			context.strokeWidth = 1;
			context.lineWidth = 1;
			context.stroke();
			
			context.fillStyle = this.color;
			context.fill();
		}
		*/
		if( intersectionList.length <= 0 ){
			// c'est encore possible que l'un sous inclus dans l'autre
			
			
			
			// attention au effets de bord
			if( this.intersectionPoint( p1 , p2[0] ) ) return { c: true , p : p2 };
			
			if( this.intersectionPoint( p2 , p1[0] ) ) return { c: true , p : p1 };
			
			return { c : false };
		}
		
		var sensP = [ sens1 , sens2 ];
		
		var poly = [ p1 , p2 ];
		
		var polyInt = [];
		
		// on calcul les vecteur qui parte du point d'intersection pour aller vers le point suivant ( si si ca revient au meme )
		var p1M = OpP.sub(  intersectionList[ 0 ].M , p1[ intersectionList[ 0 ].i[0] ]  );
		var p2M = OpP.sub(  intersectionList[ 0 ].M , p2[ intersectionList[ 0 ].i[1] ]  );
		
		
		var sensD = !( OpP.det( p1M, p2M ) > 0 );
		
		polyInt.push( intersectionList[0].M );
		
		
		var last = intersectionList[ 0 ];
		intersectionList.shift();
			
		// on retient pour fermer 
		var fermeture = last;
			
		// dans quel sens on doit parcourir le contour
		// pour l'initiation, on se fixe sur le contour 1, on regarde si dans le bon sens, on est a l'interieur du contour 2 , 
		var parcourt = ( sens2 == sensD );
		
			// 0 pour 1 , 1 pour 2
		var ligne = 0;
		
		
		function distance( now ){
				
			var dloc = ((parcourt )?(-1):(1))*( last.isharp[ ligne ] - now.isharp[ ligne ] );
			if( Math.abs( dloc ) < 0.0001 ) return 0;
			return ( dloc + poly[ ligne ].length ) % poly[ ligne ].length;
		}
		
		while( intersectionList.length > 0 ){
			
			// on cherche le suivant plus proche, en tenant compte du sens de parcourt 
			var winner = 0;
			
			var dwin = distance( intersectionList[ 0 ] ) ;
			
			for( var i = 0 ; i < intersectionList.length ; i ++ ){
				
				var dnow = distance( intersectionList[ i ] ) ;
				
				if( dnow < dwin ){
					winner = i;
					dwin = dnow;
				}
				
			}
			
			
			// le nombre de sommet que l'on saute pour parvenir au suivant
			var dd = ( ((parcourt )?(-1):(1))*( last.i[ ligne ] - intersectionList[ winner ].i[ ligne ] ) + poly[ ligne ].length ) % poly[ ligne ].length;
			
			// on ajoute ces sommets
			for( var k = 0 ; k < dd  ; k ++ ){
				var ff = ( last.i[ ligne ] + (( parcourt )?( 1 + k ):( - k )) + poly[ ligne ].length )% poly[ ligne ].length
				polyInt.push( poly[ ligne ][ ff ] );
			}
			
			polyInt.push( intersectionList[ winner ].M );
			
			last = intersectionList[ winner ];
			
			intersectionList.splice( winner , 1 );
			
			if( sens1 != sens2 ) parcourt = !parcourt;
			
			// on change de contour
			ligne = (ligne +1) %2;
			
			/*
			if( ligne == 1 ){
			var p = nextOn;
				context.beginPath();
				context.arc( p.x , p.y , 3 , 0, Math.PI*2 , false );
				context.closePath();
				
				context.strokeStyle = "rgb(0,0,0)";
				context.strokeWidth = 1;
				context.lineWidth = 1;
				context.stroke();
				
				context.fillStyle = "rgb(0,255,0)";
				context.fill();
			
			var p = rigideOff;
				context.beginPath();
				context.arc( p.x , p.y , 3 , 0, Math.PI*2 , false );
				context.closePath();
				
				context.strokeStyle = "rgb(0,0,0)";
				context.strokeWidth = 1;
				context.lineWidth = 1;
				context.stroke();
				
				context.fillStyle = "rgb(0,255,255)";
				context.fill();
			}
			
			// on change le sens du parcourt si besoin
			if( sens1 != sens2 ) parcourt = !parcourt;
			
			// on change de contour
			ligne = (ligne +1) %2;
			*/
		}
		
		// la meme chose
		var dd = ( ((parcourt )?(-1):(1))*( last.i[ ligne ] - fermeture.i[ ligne ] ) + poly[ ligne ].length ) % poly[ ligne ].length;
		
		for( var k = 0 ; k < dd  ; k ++ ){
			var ff = ( last.i[ ligne ] + (( parcourt )?( 1 + k ):( - k )) + poly[ ligne ].length )% poly[ ligne ].length;
			polyInt.push( poly[ ligne ][ ff ] );
		}
		
		return { c: true , p : polyInt };
		
			for(var k = 0 ; k < polyInt.length ; k ++ ){
				var p = polyInt[k];
				context.beginPath();
				context.arc( p.x , p.y , 2+k*2 , 0, Math.PI*2 , false );
				context.closePath();
				
				context.strokeStyle = "rgb(0,0,0)";
				context.strokeWidth = 1;
				context.lineWidth = 1;
				context.stroke();
				
				//context.fillStyle = this.color;
				//context.fill();
			}
			/*
			for(var k = 0 ; k < p1.length ; k ++ ){
				var p = p1[k];
				context.beginPath();
				context.arc( p.x , p.y , 2+k*2 , 0, Math.PI*2 , false );
				context.closePath();
				
				context.strokeStyle = "rgb(255,0,0)";
				context.strokeWidth = 1;
				context.lineWidth = 1;
				context.stroke();
				
				//context.fillStyle = "rgb(255,0,0)";
				//context.fill();
			}
			for(var k = 0 ; k < p2.length ; k ++ ){
				var p = p2[k];
				context.beginPath();
				context.arc( p.x , p.y , 2+k*2 , 0, Math.PI*2 , false );
				context.closePath();
				
				context.strokeStyle = "rgb(255,0,255)";
				context.strokeWidth = 1;
				context.lineWidth = 1;
				context.stroke();
				
				//context.fillStyle = "rgb(255,0,255)";
				//context.fill();
			}
			*/
		return { c : false };
		 
		}catch(e){ throw " intersection de polygone : "+e; }
	}


// en 2D
OpPol.intersectionPoint = function( p1 , p ){
	
	var OpP = OpP2D;
	
	var sens = ( OpP.det( OpP.sub( p1[ 1 ] , p1[ 0 ] ) , OpP.sub( p1[ 2 ] , p1[ 0 ] ) ) > 0 );
	
	for( var i = 0 ; i < p1.length ; i ++ ){
		
		var det = OpP.det( OpP.sub( p1[ (i+1)%p1.length ] , p1[ i ] ) , OpP.sub( p , p1[ i ] ) );
		
		// exclusivement
		if( Math.abs( det ) > 0.00001 && ( det > 0 != sens ) ) return false;
	}
	return true;
	
}

	
OpPol.calculHitBox = function( pol ){
			
			var top = new Point( pol[0].x , pol[0].y , pol[0].z );
			var bot = new Point( pol[0].x , pol[0].y , pol[0].z );
			
			for( var i = 1 ; i < pol.length ; i ++ ){
				if( top.x > pol[i].x ) top.x = pol[i].x;
				if( top.y > pol[i].y ) top.y = pol[i].y;
				if( top.z > pol[i].z ) top.z = pol[i].z;
				
				if( bot.x < pol[i].x ) bot.x = pol[i].x;
				if( bot.y < pol[i].y ) bot.y = pol[i].y;
				if( bot.z < pol[i].z ) bot.z = pol[i].z;
			}
			
			return { top : top , bot : bot };
}
	
	