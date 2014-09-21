//Polygon methods
(function( scope ){

/** 
 * return either false if there is no intersection with the two segments 
 * the segment are A1A2 and B1B2
 * or { t1 , t2 }  where A1 +  ( A2 - A1 ) * t1 =  B1 +  ( B2 - B1 ) * t2  is the intersection of the two segment   ( yeah, right tA , tB would be better )
 * the function doesnt not react well with null segment ( A1 = A2 )
  * @function
 *  @param { cc.Point } A1
 *  @param { cc.Point } A2
 *  @param { cc.Point } B1
 *  @param { cc.Point } B2
 *  @return { t1 : number , t2 : number }  
 * Constructor
 */
var intersectionSegmentSegment = function( A1 , A2 , B1 , B2 ){
	var 
	VAx = A2.x - A1.x,
	VAy = A2.y - A1.y,
	VBx = B2.x - B1.x,
	VBy = B2.y - B1.y,
	PAx = A1.x,
	PAy = A1.y,
	PBx = B1.x,
	PBy = B1.y;

	if( VBy * VAx - VBx * VAy == 0 )		// colineaire
		return false;

	if( VBy == 0 ){				
		var ta = ( PBy - PAy )/VAy;			// VAy != 0 sinon VA VB colineaires
		if( ta < 0 || 1 < ta)
			return false;
		var tb = ((PAx-PBx)+VAx*ta)/VBx;	// VBx != 0 sinon B1 == B2
		if( tb < 0 || 1 < tb)
			return false;
		return { ta:ta , tb:tb };
	}
	if( VAx == 0 ){
		var tb = ( PAx - PBx )/VBx;	
		if( tb < 0 || 1 < tb)
			return false;
		var ta = ((PBy-PAy)+VBy*tb)/VAy;
		if( ta < 0 || 1 < ta)
			return false;
		return { ta:ta , tb:tb };
	}
	var ta = (  (( PBx - PAx )  + VBx/VBy*(PAy-PBy) )/VAx )/( 1 - VBx * VAy / VAx / VBy );
	if( ta < 0 || 1 < ta)
		return false;
	var tb = ((PAy-PBy)+VAy*ta)/VBy;
	if( tb < 0 || 1 < tb)
		return false;
	return { ta:ta , tb:tb };

}

/**
 * return an array of Polygon, each one is convexe and all form a partition of the polygon given in argument
 * @function
 * @param { Array of Point } polygon
 * @return { Array of Array of Point }  
 * Constructor
 */
var splitInConvexesEars = function( polygon  ){

	// we will use the det for determinate if the point is in or out a side,
	// we dont know if a positif mean out or inside, ( because the is no restriction on the order of the corner )
	// we will perform a check, on all the corner and determine which is the most common 

	// +1 for each positive det , -1 for each neg
	var sum_order = 0;

	var each_order = new Array( polygon.length );

	var a = polygon[ polygon.length -2 ] , b = polygon[ polygon.length -1 ] , c;

	for( var k = 0 ; k < polygon.length ; k ++ ){

		// a then b then c

		c = polygon[ k ];

		// check if c is on the right side of the edge a b

		var det = ( a.x - b.x ) * ( c.y - b.y ) + ( b.y - a.y ) * ( c.x - b.x );

		if( det >= 0 ){
			each_order[ ( k-1+polygon.length)%polygon.length ] = true;
			sum_order ++;
		} else {
			each_order[ ( k-1+polygon.length)%polygon.length ] = false;
			sum_order --;
		}
		a = b;
		b = c;
	}

	// it is convexe
	if( Math.abs( sum_order ) == polygon.length )
		return [ polygon ];


	// lets assume the majority of vertex will not be notch
	// so if sum_order is positive we got a majority of positive det, so assume that a non not vertex has a positive vertex ( respectively negative )
	var order = sum_order >= 0 ;


	var notchs = [];
	var notch = null;
	var A , B , Av1 , Av2;
	for( var i = 0 ; i < each_order.length ; i ++ ){
		if( each_order[ i ] == order )
			continue;

		notch = {
			i : i ,
			link : [ (i+1)%polygon.length ]
			};

		A = polygon[ i ];
		Av2 = { x : A.x - polygon[ (i+1)%polygon.length ].x ,
				y : A.y - polygon[ (i+1)%polygon.length ].y  }; // prev neightbour vect
		Av1 = { x : polygon[ (i-1+polygon.length)%polygon.length ].x - A.x ,
				y : polygon[ (i-1+polygon.length)%polygon.length ].y - A.y }; // next neightbour vect


		// check the linkability with all the vertex
		var j;
		for( var aj = 2 ; aj < polygon.length - 1 ; aj ++ ){

			j = (i+aj)%polygon.length

			B = polygon[ j ];

			// check the direction of AB ( need to be inside the polygon, at least localy )
			if( ( B.x - A.x ) * Av1.y + ( A.y - B.y ) * Av1.x > 0 == order 			// right side of first neightbour
			 && ( B.x - A.x ) * Av2.y + ( A.y - B.y ) * Av2.x > 0 == order )		// right side of second neightbour
				continue;

			// check the exit on the segment A B
			var accept = true;
			for( var k = 1 ; k < polygon.length - 1 ; k ++ ){
				if( ( j + k + 1 ) % polygon.length == i  ){ // dont check the intersection with a segment that pass by A ( meaning the segment xA and Ax ) 
					k ++; 	// skip the segment Ax
					continue;
				}
				if( false != cc.Polygon.intersectionSegmentSegment( A , B , polygon[ ( j + k ) % polygon.length ] ,  polygon[ ( j + k + 1 ) % polygon.length ] ) ){
					accept = false;
					break;
				}
			}
			if( accept )
				notch.link.push( j );
		}

		notch.link.push( ( i-1+polygon.length)%polygon.length );

		notchs.push( notch );
	}

	// estimation of the largest sub poly
	for( var i = 0 ; i < notchs.length ; i ++ ){

		var er = [ notchs[ i ].i  ];
		for( var k = notchs[ i ].link.length-1 ; k >= 0 ; k -- ){
			var l = notchs[ i ].link[ k ];
			if( l != ( er[ 0 ] -1 + polygon.length ) % polygon.length || each_order[ l ] != order )
				break;	
			var e = polygon[ l ];
			if( er.length > 2 ){

				// if we add e to the stack, does it stiff form a convex polygon
				// check for the convexity of the new coner
				var a  = polygon[ er[ 0 ] ],								// corner next
					b  = polygon[ er[ 1 ] ];
				var det = ( a.x - b.x ) * ( e.y - b.y ) + ( b.y - a.y ) * ( e.x - b.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ er[ ( er.length-2 + er.length )% er.length ] ],		// corner prev
					b  =  polygon[ er[ ( er.length-1 + er.length )% er.length ] ];
				var det = ( e.x - a.x ) * ( b.y - a.y ) + ( a.y - e.y ) * ( b.x - a.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ er[ ( er.length-1 + er.length )% er.length ] ],		// corner new 
					b  =  polygon[ er[ 0 ] ];
				var det = ( a.x - e.x ) * ( b.y - e.y ) + ( e.y - a.y ) * ( b.x - e.x );
				if( det > 0 != order )
					break;
			}
			er.unshift( l );
		}

		var ea = [ notchs[ i ].i  ];
		for( var k = 0 ; k < notchs[ i ].link.length ; k ++ ){
			var l = notchs[ i ].link[ k ];
			if( l != ( ea[ ea.length - 1 ] +1 ) % polygon.length || each_order[ l ] != order ) // point have to be consecutive, l have to be next ,
				break;	
			var e = polygon[ l ];
			if( ea.length > 2 ){

				// if we add e to the stack, does it stiff form a convex polygon
				// check for the convexity of the new coner
				var a  =  polygon[ ea[ ( ea.length-2 + ea.length )% ea.length ] ],		// corner prev
					b  =  polygon[ ea[ ( ea.length-1 + ea.length )% ea.length ] ];
				var det = ( a.x - b.x ) * ( e.y - b.y ) + ( b.y - a.y ) * ( e.x - b.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ ea[ 0% ea.length ] ],										// corner next
					b  =  polygon[ ea[ 1% ea.length ] ];
				var det = ( e.x - a.x ) * ( b.y - a.y ) + ( a.y - e.y ) * ( b.x - a.x );
				if( det > 0 != order )
					break;

				var a  =  polygon[ ea[ ( ea.length-1 + ea.length )% ea.length ] ],		// corner new 
					b  =  polygon[ ea[ 0% ea.length ] ];
				var det = ( a.x - e.x ) * ( b.y - e.y ) + ( e.y - a.y ) * ( b.x - e.x );
				if( det > 0 != order )
					break;
			}
			ea.push( l );
		}

		if( er.length > ea.length )
			ea = er;

		if( ea.length > 2 ){
			// form the dual polygon
			var dual = [];
			var next = ea[ ea.length-1 ];
			while( next != ea[ 0 ] ){
				dual.push( polygon[ next ] );
				next = ( next + 1 ) % polygon.length;
			}
			dual.push( polygon[ next ] );

			var stack = [];
			for( var k = 0 ; k < ea.length ; k ++ )
				stack.push( polygon[ ea[ k ] ] );
			return [ stack ].concat( cc.Polygon.splitInConvexesEars( dual ) );

			//return [ stack ];
		}
	}

	return null;
};

/**
 * return an array of Polygon, each one is a triangle form a partition of the convex polygon given in argument
 * 
 * @function
 * @param { Array of Point } convex polygon
 * @return { Array of Array of Point }  
 * Constructor
 */
var splitInTriangle = function( poly ){
	
	var splits = [];
	
	splits.push( [ poly[0] , poly[1] , poly[2] ] );
	
	for( var i = 3 ; i< poly.length ; i ++ ){
		splits.push( [ poly[0] , poly[i-1] , poly[i] ] );
	}
	
	return splits;
}

/**
 * return the area of the polygon
 * 
 * @function
 * @param { Array of Point } convex polygon
 * @return { Number }  area of the polygon
 * Constructor
 */
var area = function( poly ){
	
	var splits = splitInTriangle( poly );
	
	var sum = 0;
	
	for( var i = 0 ; i< splits.length ; i ++ )
		sum = Math.abs( ( splits[ i ][ 1 ].x - splits[ i ][ 0 ].x ) * ( splits[ i ][ 2 ].y - splits[ i ][ 0 ].y ) - ( splits[ i ][ 2 ].x - splits[ i ][ 0 ].x ) * ( splits[ i ][ 1 ].y - splits[ i ][ 0 ].y ) );
		
	sum /= 2;
	
	return sum;
}

/**
 * return the polygon center of mass
 * 
 * @function
 * @param { Array of Point } convex polygon
 * @return { Point }  center of mass
 * Constructor
 */
var centerOfMass = function( poly ){
	
	var splits = splitInTriangle( poly )
	
	var c = { x :0 , y: 0  },
		poid,
		poidTotal = 0;
	for( var i = 0 ; i < splits.length ; i ++ ){
		
		poid = area( splits[ i ] );
		
		for( var j = 0 ; j < splits[ i ].length ; j ++ ){
			c.x+= splits[ i ][ j ].x * poid;
			c.y+= splits[ i ][ j ].y * poid;
		}
		
		poidTotal += poid;
	}
	
	c.x/=3*poidTotal;
	c.y/=3*poidTotal;
	
	return c;
}

/**
 * return the direction of the polygon
 * 
 * @function
 * @param { Array of Point } convex polygon
 * @return { Point }  vector
 * Constructor
 */
var direction = function( poly  ){
	
	var c = centerOfMass( poly );
	
	var dir = {x:0,y:0};
	
	var totalWeight = 0;
	
	for( var i = 0 ; i < poly.length ; i ++ ){
	
		var tri = [ c , poly[ i ] , poly[ (i+1)%poly.length ] ]; 
		
		var cmid = {
			x : ( poly[ i ].x + poly[ (i+1)%poly.length ].x ) *0.5 - c.x,
			y : ( poly[ i ].y + poly[ (i+1)%poly.length ].y ) *0.5 - c.y
		};
		
		var d = Math.sqrt( cmid.x * cmid.x + cmid.y * cmid.y );
		
		var weight = area( tri );
		
		if( ( cmid.x != 0 && cmid.x > 0 ) || ( cmid.x == 0 && cmid.y > 0 ) ){
		
			dir.x +=  cmid.x  * weight ;
			dir.y +=  cmid.y  * weight ;
		} else {
			dir.x -=  cmid.x  * weight ;
			dir.y -=  cmid.y  * weight ;
		}
		totalWeight += weight;
	}
	
	var po = Math.sqrt( totalWeight ) * totalWeight;
	
	dir.x = dir.x / po;
	dir.y = dir.y / po;
	
	return dir;
}

/**
 * return the polygon center of mass
 * 
 * @function
 * @param { Array of Point } convex polygon
 * @return { Point }  center of mass
 * Constructor
 */
var burst = function( poly , center  ){
	
	
	var min_surface = 2;
	
	var surface = Math.max( min_surface , area( poly ) );
	
	center = center || centerOfMass( poly );
	var neclat = Math.floor(  Math.random() * 4 + 5 );
	
	
	var loin = 1000;
	
	
	
	function calculEclatRadial( poly , a , b , sens ){
		var ia , A , ib , B, e = [];
		
		var dA = {
			x: center.x + Math.cos( a ) * loin,
			y: center.y + Math.sin( a ) * loin,
		},
		dB = {
			x: center.x + Math.cos( b ) * loin,
			y: center.y + Math.sin( b ) * loin,
		};
		
		
		
		for( var ia = 0 ; ia < poly.length ; ia ++ ){
			var re = intersectionSegmentSegment( center , dA , poly[ ia ] , poly[ ( ia +1 )%poly.length ] );
			if( re != false ){
				A = {
					x: center.x + Math.cos( a ) * loin * re.ta,
					y: center.y + Math.sin( a ) * loin * re.ta,
				};
				break;
			}
		}
		
		for( var ib = 0 ; ib < poly.length ; ib ++ ){
			var re = intersectionSegmentSegment( center , dB , poly[ ib ] , poly[ ( ib +1 )%poly.length ] );
			if( re != false ){
				B = {
					x: center.x + Math.cos( b ) * loin * re.ta,
					y: center.y + Math.sin( b ) * loin * re.ta,
				};
				break;
			}
		}
		
		
		e.push( center );
		
		e.push( sens ? A : B  );
		
		if( ia != ib ){
			for( var i = (( sens ? ia : ib )+1)%poly.length ; i != ( sens ? ib : ia ) ; i = ( i +1 )%poly.length )
				e.push( poly[ i ] );
			
			e.push( poly[ i ] );
		}
		
		e.push( sens ? B : A  );
		
		return e;
	}
	
	function calculEclatTransversal( poly , v ){
		
		// set the poly in a oriented box
		var max = -Infinity,
			min = Infinity;
		
		for( var i = 0 ; i < poly.length ; i ++ ){
			
			var d = poly[ i ].x * v.x + poly[ i ].y * v.y;
			
			if( d > max )
				max = d;
			if( d < min )
				min = d;
		}
		
		var alpha = Math.random() * 0.6 + 0.2;
		
		var cut = alpha * min + (1-alpha) * max;
		
		var o = {
			x : v.x * cut,
			y : v.y * cut,
		};
		var oh = {
			x : o.x + v.y * loin,
			y : o.y - v.x * loin,
		},
			ohh = {
			x : o.x - v.y * loin,
			y : o.y + v.x * loin,
		};
		
		
		var A = [] , B = [], side = false;
		
		var Ai = [] , Bi = [];
		
		for( var i = 0 ; i < poly.length ; i ++ ){
			
			if( side )
				A.push( poly[ i ] );
			else
				B.push( poly[ i ] );
				
			if( side )
				Ai.push( i );
			else
				Bi.push( i );
			
			var re = intersectionSegmentSegment( oh , ohh , poly[ i ] , poly[ ( i +1 )%poly.length ] );
			if( re != false ){
				var p = {
					x: oh.x - v.y * 2 * loin * re.ta,
					y: oh.y + v.x * 2 * loin * re.ta
				};
				A.push( p );
				B.push( p );
				
				Ai.push( i+0.5 );
				Bi.push( i+0.5 );
				
				side = !side;
			}
			
		}
		
		
		return [ A , B ];
	}
	
	function accepteFragement( poly ){
		
		
		// check the area
		if( area( poly ) < surface / 70 )
			return false;
		
		var dir = direction( poly );
		if( Math.sqrt( dir.x * dir.x + dir.y * dir.y ) > 0.55 )
			return false;
		
		//accept
		return true;
	};
	
	// calcul the sens
	var A = {
			x: poly[ 0 ].x - center.x ,
			y: poly[ 0 ].y - center.y
		},
		B = {
			x: poly[ 1 ].x - center.x ,
			y: poly[ 1 ].y - center.y
		};
	
	var sens = ( A.x * B.y - A.y * B.x > 0 ) ;
	
	
	var eclats = [];
		
	var leclat = Math.PI*2 / neclat;	
	
	var startA = 0;
	
	var offsetA = Math.random() * Math.PI*2;
	
	for( var i = 0 ; startA < Math.PI*2 ; i ++ ){
		
		
		leclat = Math.min( Math.PI*2/3 , Math.max( Math.PI*2 / neclat / 1.5 , ( Math.PI*2 - startA ) /( neclat - i )  * ( 0.7 + Math.random() * 0.6  ) ) );
		
		if( Math.PI*2 - startA - leclat < Math.PI/8 || startA + leclat >  Math.PI*2 )
			leclat = Math.PI*2 - startA;
		
		var endA = startA + leclat;
		
		// cut radialy
		var cer =  [ calculEclatRadial( poly , offsetA + startA , offsetA + endA , sens ) ];
		
		var a = startA + leclat / 2;
		
		var v = {
			x : cer[ 0 ][ 1 ].y - cer[ 0 ][ cer[ 0 ].length-1 ].y,
			y : -cer[ 0 ][ 1 ].x + cer[ 0 ][ cer[ 0 ].length-1 ].x
		};
		var n = Math.sqrt( v.x*v.x + v.y*v.y );
		
		v.x /= n;
		v.y /= n;
		
		// cut transversaly
		for( var i = 0 ; i < cer.length ; i ++ ){
				var cet = calculEclatTransversal( cer[ i ] , v );
				
				// happend when the ray pass exactly on a point, he does not traverse the polygone, whatever ignore that case
				if( cet[ 1 ].length <= 2 || cet[ 0 ].length <= 2 ){
					if( Math.random() > 0.5 )
						i --;
					continue;
				}
				if( !accepteFragement( cet[ 1 ] )  || !accepteFragement( cet[ 0 ] ) ){
					if( Math.random() > 0.5 )
						i --;
					continue;
				}
					
				cer[ i ] = cet[ 0 ];
				
				cer.push( cet[ 1 ] );
				
				i--;
		}
		
		
		eclats = eclats.concat( cer );
		
		startA = endA;
	}
	
	return eclats;
}



scope.centerOfMass = centerOfMass;
scope.burst = burst;
scope.area = area;


})( window );