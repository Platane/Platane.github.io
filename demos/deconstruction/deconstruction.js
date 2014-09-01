
$("body").css({ "cursor" : "progress" });

/*
TODO

-change the accept fragment function in burst
	it need to reconsider the direction of polygon computation, do somathing more looking like tha inertia calcul
	
-change the impulser direction
	make it point to the up, to achieve that, rotate the matrix P
	
*/

// change the behavior of the random function
		var _seed = 45678951585432565678;
		_seed = Math.floor( Math.random() * 10000000000 );


		//_seed = 467129903        ;

		console.log( "seed = "+_seed );
		var _offset = _seed;
		Math.random = function(){
				
			var s = _seed;
			var square = s *s;
			
			var nseed = Math.floor( square / 1000 ) % 10000000000;
			
			if( nseed != _seed )
				_seed = nseed;
			else
				_seed = nseed + _offset;
			return ( _seed / 10000000000 );
		}



window['requestAnimFrame'] = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

//Polygon
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


})( this );



var debug = ( window && window.location ) ? window.location.search == "?debug=true" : false

// destruction procedure
;(function( scope ){
	
	/*
	 * param
	 *
	 */
	var dimEngineWorld = 50; //taille du monde CANNON
	
	/*
	 * var
	 *
	 */
	var scene , renderer , camera , bodies = [] ,  textures = {};
	var ratioVisual = 1,	//ratio taille du monde CANNON / taille fenêtre
		speedEngine = 1,
		sceneBox = null,
		ratio = null;		// ratio taille fene^tre / taille source
		
	var mirrorCubeCamera;
	
	var faceProjection = function( face ){
		
		var t = face[ 0 ].copy();
		
		var a = face[ 1 ].vsub( face[ 0 ] ),
			b = face[ 2 ].vsub( face[ 0 ] );
		
		// e w g is the base of the face
		
		var e = a;
		e.normalize();
		var w = a.cross( b );
		w.normalize();
		var g = a.cross( w )
		g.normalize();
		
		
		var P = new CANNON.Mat3( [ e.x , g.x , w.x ,  e.y , g.y , w.y ,  e.z , g.z , w.z  ] ); 
		
		// inversion
		var P_ = P.inverse(); 
		
		// calcul the new poly
		var face_ = new Array( face.length );
		for( var i = 0 ; i < face.length ; i ++ )
			face_[ i ] = P_.vmult( face[ i ].vsub( t ) );
		
		return { P : P , P_ : P_ , t : t , face_ : face_ };
	};
	
	function traceLigne( A , B , color ){
		
		var r = Math.random(),
			v = Math.random(),
			b = Math.random();
		
		for( var i = 0 ;  i< 100 ; i ++ ){
				var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
					material.color.setRGB( r , v , b );
					var sphere_geometry = new THREE.SphereGeometry( 2  , 8 , 8 );
					mesh = new THREE.Mesh( sphere_geometry, material );
					mesh.position.x = A.x * ( 1 - i/100 ) + B.x * i/100;
					mesh.position.y = A.y * ( 1 - i/100 ) + B.y * i/100;
					mesh.position.z = A.z * ( 1 - i/100 ) + B.z * i/100;
					scene.add( mesh );
		}
	}
	
	
	var Body = function(){};
	Body.prototype = {
		visual : null,
		phy : null,
		mass : null,
		label : null,
		surfasicMass : 0.01,
		textureO_ : null,
		textureU_ : null,
		textureV_ : null,
		init : function( poly , material , textureO , textureU , textureV ){
			
			var l = 0.8;
			
			// search for the center of mass
			var re = faceProjection( poly );
			
			var cm_ = centerOfMass( re.face_ );
			
			var cm = new CANNON.Vec3( cm_.x , cm_.y , 0 );
			cm = re.P.vmult( cm ).vadd( re.t );
			
			var p = new Array( poly.length );
			
			// center the poly on the center of mass
			for( var i = 0 ; i < poly.length ; i ++ )
				p[ i ] = poly[ i ].vsub( cm );
			
			// create the THREE mesh
			var textureO_ ,
				textureU_ ,
				textureV_ ,
				nU,
				nV;
				
			if( textureO && textureU && textureV ){
				textureO_ = re.P_.vmult( textureO.vsub( re.t ) );
				textureU_ = re.P_.vmult( textureU );
				textureV_ = re.P_.vmult( textureV );
				
				nU = ( textureU_.x * textureU_.x + textureU_.y * textureU_.y );
				nV = ( textureV_.x * textureV_.x + textureV_.y * textureV_.y );
				
				this.textureO_ = textureO_;
				this.textureU_ = textureU_;
				this.textureV_ = textureV_;
			}	
			
			var geometry = new THREE.Geometry();
			geometry.vertices = [];
			geometry.faces = [];
			
			for( var i = 0 ;i < p.length ; i ++)
				geometry.vertices.push( new THREE.Vector3( p[i].x / ratioVisual , p[i].y / ratioVisual , p[i].z / ratioVisual ) );
			
			for( var i = 2 ; i < p.length ; i ++){
				geometry.faces.push( new THREE.Face3( 0 , i-1 , i ) );
				
				//compute the UVmapping
				if( textureO && textureU && textureV ){
					
					var OA = {
						x : re.face_[ 0 ].x - textureO_.x,
						y : re.face_[ 0 ].y - textureO_.y
					},
						OB = {
						x : re.face_[ i-1 ].x - textureO_.x,
						y : re.face_[ i-1 ].y - textureO_.y
					},
						OC = {
						x : re.face_[ i ].x - textureO_.x,
						y : re.face_[ i ].y - textureO_.y
					};
					
					geometry.faceVertexUvs[ 0 ].push( [ 
						new THREE.UV( ( OA.x * textureU_.x + OA.y * textureU_.y ) / nU , ( OA.x * textureV_.x + OA.y * textureV_.y ) / nV ) , 
						new THREE.UV( ( OB.x * textureU_.x + OB.y * textureU_.y ) / nU , ( OB.x * textureV_.x + OB.y * textureV_.y ) / nV ) , 
						new THREE.UV( ( OC.x * textureU_.x + OC.y * textureU_.y ) / nU , ( OC.x * textureV_.x + OC.y * textureV_.y ) / nV ) , 
						
						] );
				}
				
				//back face
				geometry.faces.push( new THREE.Face3( i , i-1 , 0 ) );
				
				//compute the UVmapping
				if( textureO && textureU && textureV ){
					
					var OA = {
						x : re.face_[ i ].x - textureO_.x,
						y : re.face_[ i ].y - textureO_.y
					},
						OB = {
						x : re.face_[ i-1 ].x - textureO_.x,
						y : re.face_[ i-1 ].y - textureO_.y
					},
						OC = {
						x : re.face_[ 0 ].x - textureO_.x,
						y : re.face_[ 0 ].y - textureO_.y
					};
					
					geometry.faceVertexUvs[ 0 ].push( [ 
						new THREE.UV( ( OA.x * textureU_.x + OA.y * textureU_.y ) / nU , ( OA.x * textureV_.x + OA.y * textureV_.y ) / nV ) , 
						new THREE.UV( ( OB.x * textureU_.x + OB.y * textureU_.y ) / nU , ( OB.x * textureV_.x + OB.y * textureV_.y ) / nV ) , 
						new THREE.UV( ( OC.x * textureU_.x + OC.y * textureU_.y ) / nU , ( OC.x * textureV_.x + OC.y * textureV_.y ) / nV ) , 
						
						] );
				}
			}
			
			geometry.computeCentroids();
			geometry.computeFaceNormals();
			
			var visual = new THREE.Mesh( geometry, material );
			
			visual.castShadow = true;
			visual.receiveShadow = true;
			
			
			
			// create the CANNON body
			var h = re.P.vmult( new CANNON.Vec3( 0 , 0 , l*0.5 ) );
			
			var points = [];
			for( var i = 0 ;i < p.length ; i ++)
				points.push( p[i].vadd( h ) );
			for( var i = 0 ;i < p.length ; i ++)
				points.push( p[i].vsub( h ) );
				
			var faces = [[],[]];
			for( var i = 0 ;i < p.length ; i ++){
				faces[ 0 ].push( i );
				faces[ 1 ].push( i+p.length );
			}
			for( var i = 0 ;i < p.length ; i ++)
				faces.push( [ i , i + p.length , (i+1)%p.length + p.length  , (i+1)%p.length ] );
			
			
			
			var normals = [];
			for( var i = 0 ; i < faces.length ; i ++){
				var a = points[ faces[i][ 1 ] ].vsub( points[ faces[i][ 0 ] ] ),
					b = points[ faces[i][ 2 ] ].vsub( points[ faces[i][ 0 ] ] );
					
				var n = a.cross( b );
				n.normalize();
				
				//sens
				// as the polygone is convex, all the other point should be behind the plan, exept these which are on the plan
				for( var j = 0 ; j < points.length ; j ++ ){
					var c = points[ j ].vsub( points[ faces[i][ 0 ] ] );
					var scal = n.dot( c );
					if( Math.abs( scal ) > 0.00001 ){
						if( scal > 0 )
							n.negate();
						break;
					}
				}
				normals.push( new CANNON.Vec3( n.x , n.y , n.z ) );
			}
			
			shape = new CANNON.ConvexPolyhedron ( points , faces , normals );
			this.mass = this.surfasicMass * area( p );
			phy = new CANNON.RigidBody( this.mass,shape);
			phy.position = cm.copy();
			
			
			this.visual = visual;
			this.phy = phy;
			
		},
		attach : function(){
			this.detach();
			scene.add( this.visual );
			scene.world.add( this.phy );
			bodies.push( this );
		},
		detach : function(){
			scene.remove( this.visual );
			scene.world.remove( this.phy );
			for( var i = 0 ; i < bodies.length ; i ++ )
				if( bodies[ i ] == this ){
					bodies.splice( i , 1 );
					break;
				}
		},
		unableInteraction : function(){
			this.phy.mass =this.mass;
		},
		disableInteraction : function(){
			this.phy.mass = 0;
			this.phy.angularVelocity.x = 0;
			this.phy.angularVelocity.y = 0;
			this.phy.angularVelocity.z = 0;
			
			this.phy.velocity.x = 0;
			this.phy.velocity.y = 0;
			this.phy.velocity.z = 0;
		},
		_computeNormals : function( points , faces ){
			
			var normals = [];
			for( var i = 0 ; i < faces.length ; i ++){
				var a = points[ faces[i][ 1 ] ].vsub( points[ faces[i][ 0 ] ] ),
					b = points[ faces[i][ 2 ] ].vsub( points[ faces[i][ 0 ] ] );
					
				var n = a.cross( b );
				n.normalize();
				
				//sens
				// as the polygone is convex, all the other point should be behind the plan, exept these which are on the plan
				for( var j = 0 ; j < points.length ; j ++ ){
					var c = points[ j ].vsub( points[ faces[i][ 0 ] ] );
					var scal = n.dot( c );
					if( Math.abs( scal ) > 0.00001 ){
						if( scal > 0 )
							n.negate();
						break;
					}
				}
				normals.push( new CANNON.Vec3( n.x , n.y , n.z ) );
			}
			return normals;
		},
		burst : function( c , pow ){
			
			this.detach();
			
			// real time position
			var p = new Array( this.phy.shape.vertices.length/ 2 );
			
			for( var i = 0 ; i < p.length ; i ++ )
				p[ i ] = this.phy.shape.vertices[ i ].vadd( this.phy.shape.vertices[ i + p.length ] ).mult( 0.5 );
			
			for( var i = 0 ; i < p.length ; i ++ )
				p[ i ] = this.phy.quaternion.vmult( p[ i ] ).vadd( this.phy.position ) ;
			
			
			var re = faceProjection( p );
			
			
			var center_ = centerOfMass( re.face_ );
			var center = re.P.vmult( new CANNON.Vec3( center_.x , center_.y , 0 ) ).vadd( re.t );
			
			var rawPieces = burst( re.face_ , center_ ),
				pieces = new Array( rawPieces.length );
			
			var textureO = re.P.vmult( this.textureO_ ).vadd( re.t ),
				textureU = re.P.vmult( this.textureU_ ),
				textureV = re.P.vmult( this.textureV_ );
			
			for( var i = 0 ; i < rawPieces.length ; i ++ ){
				
				var piece = new Array( rawPieces[ i ].length );
				for( var j = 0 ; j <  rawPieces[ i ].length ; j++ )
					piece[ j ] = re.P.vmult( new CANNON.Vec3( rawPieces[ i ][ j ].x , rawPieces[ i ][ j ].y , 0 ) ).vadd( re.t );
				
				var body =  Body.create( piece , this.visual.material , textureO , textureU , textureV );
				
				body.visual.castShadow = true;
				body.visual.receiveShadow = true;
				body.visual.useQuaternion = true;
				
				body.attach();
				body.unableInteraction();
				
				
				pieces[ i ] = body;
			}
			
			
			
			// give implusion,
			
			// piston bluid
			var rayon = 2;
			var nface = 4;
			var sharpness = 0.6;
			var pulse = 25;
			var up = 0.5;
			
			
			var points = [];
			var faces = [];
			points.push( re.P.vmult( new CANNON.Vec3( 0, 0 , sharpness * rayon ) ) );
			points.push( re.P.vmult( new CANNON.Vec3( Math.cos( 0 ) * rayon , Math.sin( 0 ) * rayon , 0 ) ) );
			
			for( var i = 1 ; i < nface ; i ++ ){
				points.push( re.P.vmult( new CANNON.Vec3( Math.cos( i * Math.PI*2 / nface ) * rayon , Math.sin( i * Math.PI*2 / nface ) * rayon , 0 ) ) );
				faces.push( [ 0 , i+1 , i ] );
			}
			faces.push( [ 0 , 1 , nface ] );
			
			var normals = this._computeNormals( points , faces );
			
			var shape = new CANNON.ConvexPolyhedron ( points , faces , normals );
			
			var force = re.P.vmult( new CANNON.Vec3( 0, 0 , 1 ) );
			
			force.normalize();
			
			force = force.mult( sharpness * rayon + 0.2 );
			
			var hardImpulser = new CANNON.RigidBody( 9 , shape );
			hardImpulser.position = center.vadd( force.negate() );
			hardImpulser.velocity = force.mult( pulse );
			
			scene.world.add( hardImpulser );
			
			// visual
			var mesh;
			if( debug ){
				var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
				material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
				var sphere_geometry = new THREE.SphereGeometry( rayon * sharpness / ratioVisual  , 8 , 8 );
				mesh = new THREE.Mesh( sphere_geometry, material );
				
				bodies.push( { visual : mesh , phy : hardImpulser } );
				
				scene.add( mesh );
			}
			
			// plan to remove impulsion
			(function(){
				
				var engineTimeRenaming = 750;
				var prevTime = new Date().getTime();
				var visual = mesh;
				var phy = hardImpulser;
					
				var remove = function(){
					
					var now = new Date().getTime();
					engineTimeRenaming -= ( now - prevTime ) * speedEngine;
					prevTime = now;
					
					if( engineTimeRenaming < 0 ){
					
						scene.world.remove( phy );
						
						if( debug )
							scene.remove( visual );
					}else {
						window.requestAnimFrame( remove );
					}
				};
				remove();
			})( hardImpulser , mesh );
			
			
			return pieces;
		},
	};
	Body.create = function( poly , material , textureO , textureU , textureV ){
		var b = new Body();
		b.init( poly , material , textureO , textureU , textureV );
		return b;
	}
	
	var initRatio = function( container , source ){
		
		var sourceSize = {
			x : source.width(),
			y : source.height()
		};
		
		var winSize = {
			x : container.width(),
			y : container.height()
		};
		
		ratio = {
			x : winSize.x / sourceSize.x ,
			y : winSize.y / sourceSize.y
		};
		
		ratio.x = Math.min( ratio.x , ratio.y );
		ratio.y = ratio.x;
		
		ratioVisual = Math.max( dimEngineWorld / winSize.x , dimEngineWorld / winSize.y );
	};
	
	/*
	 * read the coord of the structure
	 * add corresponding element to the world
	 * need the texture to be rendered ( with initTexture )
	 */ 
	var initStructure = function( container , source ){
		
		
		
		var bricks = source.find(".brick");
		
		bricks.each( function( ){
			
			var e = $( this );
			
			var z = 0;
			try{
				if( e.attr( "data-z" ) )
					z = parseFloat( e.attr( "data-z" ) );
			}catch( e ){ };
			
			var p = [ 
			
				new CANNON.Vec3( e.position().left * ratio.x * ratioVisual						, ( container.height() - e.position().top * ratio.y ) * ratioVisual , 				  	z * ratioVisual ),
				new CANNON.Vec3( e.position().left * ratio.x * ratioVisual						, ( container.height() - ( e.position().top + e.height() ) * ratio.y ) * ratioVisual , 	z * ratioVisual ),
				new CANNON.Vec3( ( e.position().left + e.width() ) * ratio.x * ratioVisual		, ( container.height() - ( e.position().top + e.height() ) * ratio.y ) * ratioVisual , 	z * ratioVisual ),
				new CANNON.Vec3( ( e.position().left + e.width() ) * ratio.x * ratioVisual		, ( container.height() - e.position().top * ratio.y ) * ratioVisual , 					z * ratioVisual )
			];
			
			
			var texture = new THREE.Texture( textures[ e.attr( "id" ) ] ) ;
			texture.needsUpdate = true;
			var bump = new THREE.Texture( textures[ 'bumpmap' ] ) ;
			bump.needsUpdate = true;

			var material = new THREE.MeshPhongMaterial({ 
				ambient: 0xFFFFEF,
				specular: 0x333333,
				shininess : 180,
				map : texture,
				bumpMap: bump,
				bumpScale: 0.25,
				//metal: false,
				transparent : true
			});
			
			var body = Body.create( p , material , p[1] , p[2].vsub( p[1] ) , p[0].vsub( p[1] ) );
			body.attach();
			body.disableInteraction();
			body.label = e.attr( "id" );
			
		});
		
	};
	
	/*
	 * use html2canvas to render the texture
	 * call initScene when all the texture are loaded
	 */
	var initTexture = function( container , source , callBack ){
		
		var bricks = source.find(".brick");
		
		var nTotal = 0,
			nLoaded = 0;
		
		var handler = function(){
			initStructure( container , source );
			source.css({ "display" : "none" });
			if( callBack )
				callBack.f.call( callBack.o );
		};
		source.css({ "display" : "block" });
		bricks.each( function( ){
			
			nTotal ++;
			
			var label = $(this).attr( 'id' );
			
			html2canvas( [ this ] , {
				onrendered: function( canvas ) {
					
					//$( canvas ).appendTo( $("body") ).css({"display" : "block" , "margin-left" : "auto" , "margin-right" : "auto" });
					//$( canvas ).css( {"box-shadow" : "0 0 5px 5px #4865ab" } );
					
					textures[ label ] = canvas;	
					nLoaded ++;
					if( nLoaded >= nTotal )
						handler();
				}
			});
		});
		
	};

	var initBumpmap = function(){

		var w = 256,
			h = 168

		var canvas = document.createElement('canvas');

		canvas.setAttribute('width' , w )
		canvas.setAttribute('height' , h )

		var ctx = canvas.getContext('2d')
		ctx.rect(0,0,w,h);
		ctx.fill();

		var pix = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for( var i=0;i<pix.data.length;i+=4){
			pix.data[i+0] = pix.data[i+1] = pix.data[i+2] = (Math.random()*255)<<0
			pix.data[i+3] = 255
		}

		ctx.putImageData(pix, 0, 0);

		textures[ 'bumpmap' ] = canvas


		//$(canvas).css({	'position' : 'absolute', 'top':'0'}).appendTo( $('body') )

	};
	
	/*
	 * Set up the world and static object
	 *
	 */
	var initScene = function( container , source ) {
		
		// Renderer
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setSize( container.width() , container.height() );
		renderer.shadowMapEnabled = true;
		renderer.shadowMapCullFrontFaces = false;
		$( renderer.domElement ).appendTo( container );
		
		
		// Scene
		scene = new THREE.Scene();

		// Light
		
		var light = new THREE.SpotLight( 0xffffff, 0.5, 0, Math.PI, 1 );
		light.position.set( 500 , 1500 , 2000 );
		light.target.position.set( 0, 0, 0 );
		scene.add( light );

		light.castShadow = true;

		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;

		var d = 50;

		light.shadowCameraLeft = -d;
		light.shadowCameraRight = d;
		light.shadowCameraTop = d;
		light.shadowCameraBottom = -d;

		light.shadowCameraFar = 44500;
		light.shadowCameraNear = 10;
		light.shadowCameraFov = 50;
		light.shadowBias = -0.0001;
		light.shadowDarkness = 0.5;
		

		var ambient = new THREE.AmbientLight( 0x888888 );
		scene.add( ambient );
		
		
		// Camera
		camera = new THREE.PerspectiveCamera(
			65,
			container.width() / container.height(),
			50,
			2800
		);
		camera.position.set( 60, 50, 60 );
		camera.lookAt( scene.position );
		scope.camera = camera;
		
		
		//phy
		 // Create world
        var world = new CANNON.World();
        world.gravity.set(0,-10,0);
		world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
        

		
		var visualGround = new THREE.Mesh(
			new THREE.PlaneGeometry( 50000, 50000 ),
			new THREE.MeshBasicMaterial({ 
				color: 0xDDDDDD,
				opacity: 0.1,
				transparent: true
			})
		);
		visualGround.receiveShadow = true;
		visualGround.rotation.x = -Math.PI / 2;
		visualGround.position.x = 00;
		visualGround.position.z = 00;
		scene.add( visualGround );
		
		var shapeGround = new CANNON.Plane ( new CANNON.Vec3( 0 , 1 , 0 ) );
		phyGround = new CANNON.RigidBody(0,shapeGround);
		phyGround.position.y = 0;
		world.add( phyGround );

		
		
		scene.world = world;
	};
	
	/*
	 * init motion
	 *
	 */
	var initMotion = function( container , source ){
		this.initMotion( container , source );
	};
	
	
	var updateBoxes = function( dt ) {
		
		scene.world.step( dt * speedEngine );
		
		var phy , visual;
		
		for( var i = 0 ; i < bodies.length ; i ++ ){
			
			phy = bodies[ i ].phy;
			visual = bodies[ i ].visual;
			
			
			visual.quaternion.x = phy.quaternion.x;
			visual.quaternion.y = phy.quaternion.y;
			visual.quaternion.z = phy.quaternion.z;
			visual.quaternion.w = phy.quaternion.w;
			
			visual.position.x = phy.position.x / ratioVisual;
			visual.position.y = phy.position.y / ratioVisual;
			visual.position.z = phy.position.z / ratioVisual;
			
		}
	};
	var tweeny = function(){
		this.tweeny();
	}
	var render = function render() {
	
		renderer.render(scene, camera);
	};
	
	
	var lastTime = 0;
	main = function main() {
		
		var now = new Date().getTime();
		var dt = Math.min( 50 , now - lastTime );
		lastTime = now;
		
		// Run physics
		updateBoxes( dt/1000 );
		
		tweeny( dt );
		
		render();
		window.requestAnimFrame(main);
	};
	
	
	
	
	
	// motion
	(function( scope ){
		
		var posScreen = { x : 0 , y  : 0 };
		
		var decL = 200;
		
		var camTween , speedTween , action, lookAtTween, 
			cursorCam = 0,
			cursorSpeed = 0,
			cursorAction = 0,
			cursorLookAt = 0,
			currentTime = 0;
		
		function computePoints( points ){
			
			var seg = 1;
			
			var cp = [];
			
			var getP = function( O , A , B ){
				w = A.vsub( O ).cross( B.vsub( O ) );
				w.normalize();
					e = new CANNON.Vec3( 1 , 0 , 0 ).cross( w );
				if( e.isZero() ){
					e = new CANNON.Vec3( 0 , 1 , 0 );
				} else {
					e.normalize();
				}
				
				g = e.cross( w );
				
				return new CANNON.Mat3( [ e.x , g.x , w.x ,  e.y , g.y , w.y ,  e.z , g.z , w.z  ] );
			};
			var computeBezier = function( O , A , B , Ce ){
				
				var P = getP( O , A , B );
				var P_ = P.inverse();
				
				var Ce_ = P_.vmult( Ce.vsub( O ) ),
					B_  = P_.vmult( B.vsub( O ) );
				Ce_.z = 0;
			}
			// push the last control
			var v = points[ 0 ].p.vsub( points[ 1 ].p );
			
			points.unshift( { p : points[ 0 ].p.vadd( v ) , t : 0 } );
			
			
			lastControl = points[ 0 ].p;
			
			cp.push( points[ 1 ] );
			
			for( var i = 1 ; i < points.length-1 ; i ++ ){
				
				var O = points[ i ].p,
					A = lastControl,
					B = points[ i+1 ].p;
				
				
				if( A.vsub( O ).cross( B.vsub( O ) ).isZero() ){
					//colinéaire
					
					lastControl = points[ i-1 ].p;
					var pas = 15;
					for( var j = 0 ; j <  pas ;  j ++ ){
					
						var t = j/pas;
						
						cp.push( { p : new CANNON.Vec3( O.x * ( 1 - t ) +  B.x * t , O.y * ( 1 - t ) +  B.y * t , O.z * ( 1 - t ) +  B.z * t ) , t: points[ i ].t * ( 1-t ) +   points[ i +1 ].t * t }  );
					}
				} 
				else
				{
			
				var P = getP( O , A , B );
				var P_ = P.inverse();
				
				var Ce_ = P_.vmult( lastControl.vsub( O ) ),
					B_  = P_.vmult( B.vsub( O ) );
					
				Ce_.z = 0;
				
				//determine the new point of control, work in 2D
				var vCe_ = Ce_.copy()
				vCe_.normalize();
				
				var B_squ = B_.dot( B_ );
				
				var t_mid = B_squ / B_.dot( vCe_ ) * 0.5,
					t_up  = B_squ / ( B_.y * vCe_.x - B_.x * vCe_.y )  * 0.5;
				
				var t = -Math.min( Math.abs( t_mid ) , Math.abs( t_up ) );
				var C_ = vCe_.mult( t );
				
				
				// calcul the time gap
				var pas = 20;
				
				// draw the bezier curve
				var d = new Array( pas );
				
				for( var j = 0 ; j <  pas ;  j ++ ){
					
					var t = j/pas;
					
					var p_ = new CANNON.Vec3(
						(1-t)*(1-t)*  0  + 2*t*( 1-t )*  C_.x  + t*t*  B_.x,
						(1-t)*(1-t)*  0  + 2*t*( 1-t )*  C_.y  + t*t*  B_.y,
						0 );
					
					var p = P.vmult( p_ ).vadd( O );
					
					d[ j ] = ( ( j == 0 ) ? 0 : d[ j-1 ] ) + p.distanceTo( cp[ cp.length-1 ].p ); 
					
					//cp.push( { t : points[ i ].t * ( 1-t ) +   points[ i +1 ].t * t ,
					cp.push( { t : 0 ,
						p : p } );
				}
				
				//correct the time
				for( var j = 0 ; j <  pas ;  j ++ ){
					var alpha = d[ j ] / d[ pas-1 ];
					cp[ cp.length - 1 - pas + j ].t = points[ i ].t * ( 1-alpha ) +   points[ i +1 ].t * alpha;
				}
				
				//traceLigne( lastControl , P.vmult( C_ ).vadd( O ) );
				
				lastControl = P.vmult( C_ ).vadd( O );
				
				}
				
			}
			
			points.shift();
			
			return cp;
		}
		
		function initUserMotion( container , source ){
			// bind user event
			(function(  ){
				
				$('body').bind( "mousemove" , function( e ){
					
					var offsetx = e.offsetX || e.pageX - container.position().left,
						offsety = e.offsetY || e.pageY - container.position().top;
					
					posScreen.x = Math.max( -1, Math.min( 1 , ( offsetx / container.width() )*2-1 ) );
					posScreen.y = Math.max( -1, Math.min( 1 , ( offsety / container.height() )*2-1 ) );
					
				});
				
				
			})( );
		};
		
		function initMotion( container , source ){
			
			var fonzie = null;
			
			var action_bum = function( label ){
				for( var i = 0 ; i < bodies.length ; i++ )
					if( bodies[ i ].label == label )
						bodies[ i ].burst();
			};
			var action_addFonzie = function( label ){
				/*
				var geometry = new THREE.Geometry();
					geometry.vertices = [ 
						new THREE.Vector3( 0 / ratioVisual , 0 / ratioVisual , 0 / ratioVisual ),
						new THREE.Vector3( 0 / ratioVisual , 0 / ratioVisual , 16/ ratioVisual ),
						new THREE.Vector3( 0 / ratioVisual , 20 / ratioVisual , 16/ ratioVisual ),
						new THREE.Vector3( 0 / ratioVisual , 20 / ratioVisual , 0/ ratioVisual )
						];
					geometry.faces = [ new THREE.Face4( 0 , 1 , 2 , 3 ),new THREE.Face4( 3 , 2 , 1 , 0 ) ];
					
					geometry.faceVertexUvs[ 0 ].push( [ 
						new THREE.UV( 0 , 0 ) , 
						new THREE.UV( 1 , 0 ) , 
						new THREE.UV( 1,  1 ) , 
						new THREE.UV( 0,  1 ) 
						
						] );
						
					geometry.faceVertexUvs[ 0 ].push( [ 

						new THREE.UV( 0 , 1 ) , 
						new THREE.UV( 1 , 1 ) , 
						new THREE.UV( 1,  0 ) , 
						new THREE.UV( 0,  0 )  
						
						] );
					geometry.computeCentroids();
					geometry.computeFaceNormals();
					
					
					var texture = THREE.ImageUtils.loadTexture("./ressource/fonzie.png");
					var material = new THREE.MeshBasicMaterial( {map: texture } );
					material.transparent = true;
					
					fonzie = new THREE.Mesh( geometry, material );
					
					scene.add( fonzie );
					
					fonzie.rotation.y = Math.PI/2;
					fonzie.rotation.x = 3*Math.PI/2;
					
					fonzie.position.x = 25;
					fonzie.position.y = 0;
					fonzie.position.z = -5;
				*/
				$("#fonzie").css({ "display" : "block"});
				$(".thanks").css({ "display" : "block"});
				
			};
			var action_addFonzie2 = function(  ){
				$("#fonzie").addClass( "visible" );
				$(".thanks").addClass( "visible" );
			};
			var action_rotateFonzie = function(  ){
				//fonzie.rotation.x += Math.PI/200;
			};
			
			speedTween = [ 
							{ t : -1 , speed : 0 },
							{ t : 12800 , speed : 0 },
							{ t : 12820 , speed : 1 },
							{ t : 13050 , speed : 1 },
							{ t : 13200 , speed : 0.2 },
							{ t : 16550 , speed : 0.2 },
							{ t : 16560 , speed : 2 },
							{ t : 17060 , speed : 1.3 },
							{ t : 17070 , speed : 0.2 },
							{ t : 19000 , speed : 0.2 },
							{ t : 19010 , speed : 1.2 },
							{ t : 20250 , speed : 1.2 },
							{ t : 20300 , speed : 0.2 },
							{ t : 24300 , speed : 0.2 },
							{ t : 27200 , speed : 1 },
							{ t : 27300 , speed : 1.3 },
							{ t : 27400 , speed : 1.3 },
							{ t : 27410 , speed : 0.2 },
							{ t : 29610 , speed : 0.2 },
							{ t : 32500 , speed : 0.2 },
							{ t : 33000 , speed : 1.3 },
							{ t : 33300 , speed : 1.3 },
							{ t : 33251 , speed : 0.2 },
							{ t : 38000 , speed : 0.13 },
							{ t : 38900 , speed : 1 },
						];
			action = [ 
				{ t : 12830 , f : function(){ action_bum( "skill" ); } },
				{ t : 17000 , f : function(){ action_bum( "hobby" ); } },
				{ t : 20170 , f : function(){ action_bum( "contact" ); } },
				{ t : 27360 , f : function(){ action_bum( "illu" ); } },
				{ t : 33000 , f : function(){ action_bum( "exp" ); } },
				{ t : 33300 , f : function(){ action_bum( "training" ); } },
				{ t : 40000 , f : function(){ action_addFonzie(); } },
				{ t : 40500 , f : function(){ action_addFonzie2(); } },
			];
			for( var t = 0 ; t < 100 ; t ++ )
				action.push( { t : 40500 + t*18 , f : action_rotateFonzie } );
			
			
			var splines = tween;
			
			camTween = new Array( splines.camTween.length );
			for( var i = 0 ; i < camTween.length ; i ++ ){
				camTween[ i ] = {
					t : splines.camTween[ i ].t,
					p : new THREE.Vector3( splines.camTween[ i ].p.x / ratioVisual , splines.camTween[ i ].p.y / ratioVisual , splines.camTween[ i ].p.z / ratioVisual )
				}
			}
			lookAtTween = new Array( splines.lookAtTween.length );
			for( var i = 0 ; i < lookAtTween.length ; i ++ ){
				lookAtTween[ i ] = {
					t : splines.lookAtTween[ i ].t,
					p : new THREE.Vector3( splines.lookAtTween[ i ].p.x / ratioVisual , splines.lookAtTween[ i ].p.y / ratioVisual , splines.lookAtTween[ i ].p.z / ratioVisual )
				}
			}
			
			
			if( debug )
			(function( cp ){
				
				for( var i = 0 ; i < cp.length ; i ++ ){
					
					var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
					material.color.setRGB( 0.4141,  0.191, i /cp.length );
					var sphere_geometry = new THREE.SphereGeometry( 3  , 8 , 8 );
					mesh = new THREE.Mesh( sphere_geometry, material );
					mesh.position.x = cp[ i ].p.x;
					mesh.position.y = cp[ i ].p.y;
					mesh.position.z = cp[ i ].p.z;
					scene.add( mesh );
				}
				
			})( camTween );
			
			
			
			// bind user event
			initUserMotion( container , source );
		};
		
		function tweeny( d ){
			
			currentTime = $("#sound_player")[0].currentTime * 1000;
			
			var speed;
			
			for(  ; cursorSpeed < speedTween.length && speedTween[ cursorSpeed ].t <= currentTime ;  cursorSpeed ++ );
			if( cursorSpeed >= speedTween.length-1 )
				speed = speedTween[ speedTween.length - 1 ].speed;
			else {
				var alpha = ( currentTime - speedTween[ cursorSpeed-1 ].t ) / ( speedTween[ cursorSpeed  ].t - speedTween[ cursorSpeed -1 ].t ) ;
				speed = ( 1 - alpha ) * speedTween[ cursorSpeed-1 ].speed + alpha * speedTween[ cursorSpeed ].speed;
			}
			
			
			var position;	
			for(  ; cursorCam < camTween.length && camTween[ cursorCam ].t <= currentTime ;  cursorCam ++ );
			if( cursorCam >= camTween.length )
				position = camTween[ camTween.length - 1 ].p;
			else {
				var alpha = ( currentTime - camTween[ cursorCam-1 ].t ) / ( camTween[ cursorCam ].t - camTween[ cursorCam-1 ].t ) ;
				position = new THREE.Vector3( 
										( 1 - alpha ) * camTween[ cursorCam-1 ].p.x + alpha * camTween[ cursorCam ].p.x ,
										( 1 - alpha ) * camTween[ cursorCam-1 ].p.y + alpha * camTween[ cursorCam ].p.y ,
										( 1 - alpha ) * camTween[ cursorCam-1 ].p.z + alpha * camTween[ cursorCam ].p.z );
			}
			
			var lookAt;
			for(  ; cursorLookAt < lookAtTween.length && lookAtTween[ cursorLookAt ].t <= currentTime ;  cursorLookAt ++ );
			if( cursorLookAt >= lookAtTween.length )
				lookAt   = lookAtTween[ lookAtTween.length - 1 ].p;
			else {
				var alpha = ( currentTime - lookAtTween[ cursorLookAt-1 ].t ) / ( lookAtTween[ cursorLookAt ].t - lookAtTween[ cursorLookAt-1 ].t ) ;
				lookAt = new THREE.Vector3( 
										( 1 - alpha ) * lookAtTween[ cursorLookAt-1 ].p.x + alpha * lookAtTween[ cursorLookAt ].p.x ,
										( 1 - alpha ) * lookAtTween[ cursorLookAt-1 ].p.y + alpha * lookAtTween[ cursorLookAt ].p.y ,
										( 1 - alpha ) * lookAtTween[ cursorLookAt-1 ].p.z + alpha * lookAtTween[ cursorLookAt ].p.z );
			}
			
			//
			for(  ; cursorAction < action.length && action[ cursorAction ].t <= currentTime ;  cursorAction ++ )
				action[ cursorAction ].f.call( this );
			
			
			moveCamera( position , lookAt );
			
			speedEngine = speed;
			
		};
		
		function moveCamera( position , view ){
			
			camera.position.x = position.x;
			camera.position.y = position.y;
			camera.position.z = position.z;
			
			
			var v = new THREE.Vector3().sub( view , position );
			
			var n = v.length();
			
			var y = new THREE.Vector3( 0 , 1 , 0 );
			var e = v.divideScalar( n );
			var g = new THREE.Vector3().cross( e , y );
			g.normalize();
			
			var tdecL = decL * Math.max( 0.5 , n * ratioVisual  / 50 ); 
			
			
			var upPos = new THREE.Vector3().copy( position );
			upPos.add( upPos , g.multiplyScalar(  posScreen.x * tdecL ) );
			upPos.add( upPos , y.multiplyScalar(  posScreen.y * tdecL ) );
			
			
			camera.position.x = upPos.x;
			camera.position.y = upPos.y;
			camera.position.z = upPos.z;
			
			
			camera.lookAt( view );
			
		};
		
		
		scope.tweeny = tweeny;
		scope.initMotion = initMotion;
		
	} )(  this );
	
	
	scope.init = function( container , structure , callBack ) {
		initRatio( container , structure );
		initBumpmap();
		initTexture( container , structure , callBack );
		
		// unless initSctructure, those function does not recquire the texture tu be loaded
		initScene( container , structure );

		initMotion( container , structure );
	};
	scope.go = function(){
		lastTime = new Date().getTime();
		requestAnimFrame(main);
	};
			
	
})( window );





