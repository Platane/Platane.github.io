
/*
* pseudo classe statique
*/
var OpM = {
	matriceIdentite : function ( n ) { 
			
			
			var m = new Array(n);
			
			for( var i = 0 ; i < n ; i ++ ){
				
				m[i] = new Array(n);
				for( var j = 0 ; j < n ; j ++ ){
					
					m[i][j] = (i==j)?(1):(0);
				}
			}
			
			return m;
	},
	matriceRandom : function ( n , m ) { 
			
			
			var M = new Array(n);
			
			for( var i = 0 ; i < n ; i ++ ){
				
				M[i] = new Array(m);
				for( var j = 0 ; j < m ; j ++ ){
					
					M[i][j] = Math.floor((( Math.random() * 20 ) -10 ) );
				}
			}
			
			return M;
	},
	toString : function ( M ) { 
			
			var rep = "";
			
			for( var i = 0 ; i < M.length ; i ++ ){
				rep = rep+ "| ";
				for( var j = 0 ; j < M[0].length ; j ++ ){
					rep =rep+ M[i][j]+" ,";
				}
				rep =rep+ "|<br>";
			}
			
			return rep;
	},
	toStringFloor : function ( M , virg ) { 
			
			
			var charRetourLigne = "<br>";
			var charBlank = "&nbsp";
			var charZero = "&nbsp";
			
			if( virg == null ) virg = 2;
			
			var maxLength = 0;
			for( var i = 0 ; i < M.length ; i ++ ){
				for( var j = 0 ; j < M[0].length ; j ++ ){
					maxLength = Math.max( maxLength , (""+Math.floor( M[i][j] )).length );
				}
			}
			
			var rep = "";
			
			for( var i = 0 ; i < M.length ; i ++ ){
				rep = rep+ "| ";
				for( var j = 0 ; j < M[0].length ; j ++ ){
					rep =rep+ miseEnForme( M[i][j] )+" ,";
				}
				rep =rep+ "|" + charRetourLigne;
			}
			
			return rep;
			
			function miseEnForme( n ){
				
				var powDix = Math.pow( 10 , virg );
				
				var m = Math.round( n * powDix ) / powDix;
				
				var l = (Math.floor( m )+"").length;
				
				if( m % 1 == 0 ){
					if( charZero == null ){
						m = ""+m+",";
						for( var i = 0 ; i < virg ; i ++ ){
							m += "0";
						}
					}else{
						for( var i = 0 ; i < virg +1 ; i ++ ){
							m += charZero;
						}
					}
				}
				
				for( var i = 0 ; i < maxLength - l ; i ++ ){
					m = charBlank+m;
				}
				
				return m;
			}
	},
	multiplication : function( A , B ){
			
			if( A[0].length != B.length ) alert('multiplication impossible');
			
			var M = new Array( A.length );
			
			for( var i = 0 ; i < M.length ; i ++ ){
				
				M[i] = new Array( B[0].length );
				
				for( var j = 0 ; j < M[0].length ; j ++ ){
					
					M[i][j] = 0;
					
					for( var k = 0 ; k < B.length ; k++ ){
						
						M[i][j] += B[k][j] * A[i][k];
					}
				}
			}
			
			return M;
			
	},
	matriceClone : function ( Or_M ){
		
		var M = new Array( Or_M.length );
			
			for( var i = 0 ; i < Or_M.length ; i ++ ){
				
				M[i] = new Array( Or_M[0].length );
				for( var j = 0 ; j < Or_M[0].length ; j ++ ){
					
					M[i][j] =  Or_M[i][j];
				}
			}
			
			return M;
	},
	/* pas fini, en fait c'est mega dur */
	/* ca serait bien de bosser la dessus */
	ligneRedondante : function ( M ){
		
		//deja on vire tout les 0
		
		var redondance = [];
		
		var red = new Array();
		
		for( var i = 0 ; i < M.length ; i ++ ){
			
			var zero = true;
			
			for( var j = 0 ; j < M[0].length ; j ++ ){
				if( j != 0 )zero = false;
			}
			
			if( zero ) redondance.push( i );
			red[i] = true;
		}
		
		
		
	},
	inversionDeGaussJordan : function ( Or_M ){
		
		// on avait une erreur avec des nombre a mantisse eleve negative
		// a cet endroit la 
		// while( Math.abs( M[i][i] ) < tolerance ){
		var tolerance = 0.0000000001;
		
		var M = this.matriceClone( Or_M );
		
		if( M[0].length != M.length ) throw "inversion impossible";
			
		var M_ = this.matriceIdentite( M.length );
		
		for( var i = 0 ; i < M.length ; i ++ ){
			var k = 1;
			// tant que l'on a un 0 comme pivot, on swap les lignes
			while( Math.abs( M[i][i] ) < tolerance ){
				
				if( i+k >= M.length ) throw "inversion impossible";
				
				M = swap( i , i+k , M );
				M_ = swap( i , i+k , M_ );
				
				k++;
				
			}
			
			for( var j = i+1 ; j < M.length ; j ++ ){
				
				var c = M[j][i];
				
				M  = lineaire( i , c , j , -M[i][i] , M  );
				M_ = lineaire( i , c , j , -M[i][i] ,M_ );
			}
		}
		
		for( i = 0 ; i < M.length ; i ++ ){	
			var i_ = M.length-1-i;
				
			for( var j = 0 ; j < i_ ; j ++ ){
				
				var c = M[ j ][ i_ ];
				
				M   = lineaire( i_ , c , j , -M[i_][i_], M  );
				M_  = lineaire( i_ , c , j , -M[i_][i_], M_  );
			}
		}
		
		for( i = 0 ; i < M.length ; i ++ ){	
			
			var c =1/M[ i ][ i ];
			M  = scal( i , c , M  );
			M_ = scal( i , c , M_ );
		}
		
		return M_;
		
		
		//swap les lignes i et j
		function swap( i , j , M ){
			
			var tmp = M[i];
			M[i] = M[j];
			M[j] = tmp;
			
			return M;
		}
		//j = j*h + i*k
		function lineaire( i , k , j , h , M ){
			
			for( var l = 0 ; l < M.length ; l ++ ){
				M[j][l] = M[j][l] *h  + k * M[i][l];
			}
			return M;
		}
		//j = j*k
		function scal( i , k ,  M ){
			
			for( var l = 0 ; l < M.length ; l ++ ){
				M[i][l] = M[i][l] * k;
			}
			return M;
		}
		
		
		
	},
	determinant : function ( Or_M ){
		
		if( Or_M.length == 1 && Or_M[0].length == 1 ){
			return Or_M[0][0];
		} else {
			if( Or_M.length >= Or_M[0].length ){
				
				var som = 0;
				
				for( var i = 0 ; i < Or_M.length ; i ++ ){
				
					som += Or_M[i][0] * Math.pow( -1 , i ) * this.determinant( sousMatrice( Or_M , i , 0 ) );
				}
				
				return som;
			}else{
				var som = 0;
				
				for( var i = 0 ; i < Or_M[0].length ; i ++ ){
				
					som += Or_M[i][0] * Math.pow( -1 , i ) * this.determinant( sousMatrice( Or_M , 0 , i ) );
				}
				
				return som;
			}
		}
		
		
		function sousMatrice( M , i , j ){
			
			
			var sM = new Array( M.length -1 );
			for( var k = 0 ; k< sM.length ; k ++ ){
				sM[k] = new Array( M[0].length -1 );
				
				for( var l = 0 ; l< sM[0].length ; l ++ ){
					
					sM[k][l] = M[  (k<i)?(k):(k+1)  ][  (l<j)?(l):(l+1)  ];
				}
			}
			
			return sM;
		}
			
		
	},
	// pas testé, il faudrait
	matriceRotation : function ( angle , axe ){

		var cos = Math.cos( angle );
		var sin = Math.sin( angle );
				
		

		var e = new Point( 1 , 0 , 0 );
					
		var scal = OpP.scalaire( e , axe );
					
		var w;
					
		if( scal == 1 ){
			e = new Point( 0 , 1 , 0 );
			w = new Point( 0 , 0 , 1 );
		} else {
			e = OpP.normalise( OpP.add( e , OpP.scal( axe , -scal ) ) );
			w = OpP.det( axe , e );
		}
		

		var rotation = [ 	[ cos , -sin , 0 ],
							[ sin , cos  , 0 ],
							[ 0   ,  0   , 1 ] ];
			
		var matriceAxe = 				[ 		[ e.x , w.x , axe.x ],
												[ e.y , w.y , axe.y ],
												[ e.z , w.z , axe.z ] ];
					
		return this.multiplication( this.inversionDeGaussJordan( matriceAxe ) , this.multiplication( rotation , matriceAxe ) );
		
	},
	scal : function ( M , kal ){
		
		var M_ = new Array( M.length );
		
		for( var i = 0 ; i < M.length ; i ++ ){
			M_[i] = new Array( M[0].length );
			for( var j = 0 ; j < M[0].length ; j ++ ){
					
				M_[i][j] = kal * M[i][j];
			}
		}
		
		return M_;
	}
	
}	

/*
* pseudo classe statique
*/

function Point (x,y) {
	
	this.x = x;
	this.y = y;
}

function PString( a ){
	return flow(a.x)+", "+flow(a.y);
}
function flow( x ){
	var decimal = 7;
	return ( Math.round( x * Math.pow(10,decimal) )/Math.pow(10,decimal) );
}

var OpP = {
	application : function( A , p ){
		
		return new Point(
			A[0][0] * p.x + A[0][1] * p.y,
			A[1][0] * p.x + A[1][1] * p.y );
	},
	norme : function( p ){
		return Math.sqrt( this.scalaire( p , p ) );
	},
	equals : function( a , b  ){
		return (a.x == b.x && a.y == b.y );
	},
	scalaire : function( a , b ){
		return a.x*b.x + a.y*b.y ;
	},
	scal : function( a , l ){
		return new Point( a.x * l , a.y * l );
	},
	normalise : function( a ){
		return this.scal( a , 1/this.norme( a ) );
	},
	det : function( a , b ){
		return 	a.x * b.y - a.y * b.x ;
	
	},
	add : function( a , b ){
		return new Point( a.x +b.x , a.y +b.y );
	},
	sub : function( a , b ){
		return new Point( a.x -b.x , a.y -b.y );
	},
	distance : function( a , b ){
		return this.norme( this.sub( a , b ) );
	},
	intersectionDroite : function( a , vA , b , vB ){
		
		var system = [	[ vA.x , -vB.x ],
						[ vA.y , -vB.y ] ];
		
		try{
			var inverse = OpM.inversionDeGaussJordan( system );
		} catch ( e ){
			return { c : false };
		}
		
		var rep = OpM.multiplication( inverse , [ [ b.x - a.x ],  [ b.y - a.y ] ] );
		
		return { c : true , ta : rep[0][0] , tb : rep[1][0] };
	},
	intersectionSegment : function( A1 , B1 , A2 , B2 ){
		
		var v1 = this.sub( B1 , A1 );
		
		var rep = this.intersectionDroite( A1 , v1 , A2 , this.sub( B2 , A2 ) );
		
		if( !rep.c || rep.ta > 1 || rep.tb > 1 || rep.ta < 0 || rep.tb < 0 ) return {c:false};
		
		return { c: true , M : this.add( A1 , this.scal( v1 , rep.ta ) ) , ta : rep.ta , tb : rep.tb  };
	},
	intersectionSegmentPlus : function( A1 , B1 , A2 , B2 ){
		
		var cacestlepetitplus = 0.000001;
		
		var v1 = this.sub( B1 , A1 );
		
		var rep = this.intersectionDroite( A1 , v1 , A2 , this.sub( B2 , A2 ) );
		
		if( !rep.c || rep.ta > 1+cacestlepetitplus || rep.tb > 1+cacestlepetitplus || rep.ta < -cacestlepetitplus || rep.tb < -cacestlepetitplus ) return {c:false};
		
		return { c: true , M : this.add( A1 , this.scal( v1 , rep.ta ) ) , ta : rep.ta , tb : rep.tb  };
	},
	toString : function( a ){
		return flow(a.x)+", "+flow(a.y);
		function flow( x ){
			var decimal = 2;
			return ( Math.round( x * Math.pow(10,decimal) )/Math.pow(10,decimal) );
		}
	}
}