
	var visualRatio = 1;
	
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
				var pas = 30;
				
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
		
		function initMotion( container , source ){
			
			var fonzie = null;
			
			var bum = function( label ){
				for( var i = 0 ; i < bodies.length ; i++ )
					if( bodies[ i ].label == label )
						bodies[ i ].burst();
			};
			
			var sceneSize = {
				x: 50,
				y: 50
			};
			
			lookAtTween = [ 	
							{ t : -1 , p : new THREE.Vector3( sceneSize.x / 2 , sceneSize.y / 2 , 0 ) },
							
							
							{ t : 12830 , p : new THREE.Vector3( sceneSize.x / 2 , 13 , 0 ) },
							{ t : 16500 , p : new THREE.Vector3( sceneSize.x / 2 , 13 , 10 ) },
							{ t : 16500 , p : new THREE.Vector3( sceneSize.x / 2 , 13 , 10 ) },
							{ t : 17000 , p : new THREE.Vector3( sceneSize.x / 2 , 2 , 0 ) },
							
							{ t : 19200 , p : new THREE.Vector3( sceneSize.x / 2 , 2 , 0 ) },
							{ t : 20050 , p : new THREE.Vector3( 10 , 45 , 0 ) },
							
							{ t : 25050 , p : new THREE.Vector3( 10 , 45 , 0 ) },
							{ t : 27360 , p : new THREE.Vector3( 40 , 40 , 0 ) },
							{ t : 29160 , p : new THREE.Vector3( 40 , 50 , 30 ) },
							{ t : 33200 , p : new THREE.Vector3( sceneSize.x / 2 , 30 , -5 ) },
							
							{ t : 37000 , p : new THREE.Vector3( sceneSize.x / 2 , 30 , -5 ) },
							{ t : 38000 , p : new THREE.Vector3( sceneSize.x / 2 , 0 , 0 ) },
						];
						
			
			function valueAt( model , t  ){
				for( var i = 1 ; i < model.length && model[ i ].t <= t ;  i ++ );
				if( i >= model.length-1 )
					return model[ model.length-1 ].p;
				else {
					var alpha = ( t - model[ i -1 ].t ) / ( model[ i ].t - model[ i -1 ].t ) ;
					return new THREE.Vector3(
						( 1 - alpha ) *  model[ i -1 ].p.x + alpha * model[ i ].p.x,
						( 1 - alpha ) *  model[ i -1 ].p.y + alpha * model[ i ].p.y,
						( 1 - alpha ) *  model[ i -1 ].p.z + alpha * model[ i ].p.z );
				}
			}
			
			// put trembling
			function addTremble( start , end , k , l ){
				
				var l = l || 1.2;
				var vois = 30;
				
				for( var i = 0 ; i < k ; i ++ ){
					var alpha = i/(k-1);
					
					var t = start * ( 1 - alpha ) + end * alpha;
					var y = valueAt( lookAtTween , t-vois  ); 
					lookAtTween.push( { t : t-vois , p : new THREE.Vector3( y.x , y.y , y.z ) } );
					
					var y = valueAt( lookAtTween , t  ); 
					lookAtTween.push( { t : t , p : new THREE.Vector3( y.x , y.y + l , y.z ) } );
					
					var y = valueAt( lookAtTween , t+vois  ); 
					lookAtTween.push( { t : t+vois , p : new THREE.Vector3( y.x , y.y , y.z ) } );
				}
			}
			
			var u = 18;
			
			addTremble( 0 , 1200 , u , 0.1 );
			
			addTremble( 1846 , 3056 , u , 0.25 );
			addTremble( 3536 , 4737 , u , 0.4);
			
			addTremble( 5254 , 6475 , u , 0.8);
			addTremble( 7000 , 8200 , u -1);
			
			addTremble( 8689 , 9894 , u );
			addTremble( 10396 , 11468 , u , 0.8 );
			
			
			addTremble( 19500 , 20200 , 8 , 3 );
			
			addTremble( 24800 , 25300 , 8 , 3 );
			
			addTremble( 30300 , 30900 , 8 , 3 );
			
			addTremble( 33000 , 33900 , 8 , 3 );
			
			lookAtTween.sort( function( a , b ){ return ( a.t > b.t ) ? 1 : -1 ; } );
			
			
			
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
				
				
				
				{ t : 12830 , f : function(){ bum( "skill" ); } },
				{ t : 17000 , f : function(){ bum( "hobby" ); } },
				{ t : 20170 , f : function(){ bum( "contact" ); } },
				{ t : 27360 , f : function(){ bum( "illu" ); } },
				
				{ t : 33000 , f : function(){ bum( "exp" ); } },
				{ t : 33300 , f : function(){ bum( "training" ); } },
				
				{ t : 40000 , f : function(){
					
					
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
				} },
				
				
			];
			for( var t = 0 ; t < 100 ; t ++ )
				action.push( { t : 40500 + t*18 , f : function(){
					fonzie.rotation.x += Math.PI/200;
				} } );
			
			
			var cp = computePoints( [
				{ t : -1 , p : new CANNON.Vec3( sceneSize.x / 2 , sceneSize.y / 2 , 40 ) },
				{ t : 2000 , p : new CANNON.Vec3( sceneSize.x / 2 , sceneSize.y / 3 , 45 ) },
				{ t : 3000 , p : new CANNON.Vec3( sceneSize.x / 2 , 10 , 50 ) },
				{ t : 4000 , p : new CANNON.Vec3( sceneSize.x / 2 +50 , 0 , 0 ) },
				{ t : 5000 , p : new CANNON.Vec3( sceneSize.x / 2  , 0 , -50 ) },
				{ t : 6000 , p : new CANNON.Vec3( sceneSize.x / 2 -50 , 0 , 0 ) },
				{ t : 7000 , p : new CANNON.Vec3( sceneSize.x / 2 , 0 , 50 ) },
				{ t : 8000 , p : new CANNON.Vec3( sceneSize.x / 2 , 50 , 80 ) },
				{ t : 11450 , p : new CANNON.Vec3( -10 , 10 , 10 ) },
				{ t : 12140 , p : new CANNON.Vec3( sceneSize.x / 2 , 5 , 25 ) },
				{ t : 12830 , p : new CANNON.Vec3( sceneSize.x +10 , 10 , 3 ) },
				
				{ t : 16250 , p : new CANNON.Vec3( sceneSize.x +10 , 10 , 3 ) },
				{ t : 17050 , p : new CANNON.Vec3( sceneSize.x /2 -10 , 5 , 23 ) },
				{ t : 19050 , p : new CANNON.Vec3( sceneSize.x /2 -10 , -2 , 30 ) },
				{ t : 19400 , p : new CANNON.Vec3( 3 , -5 , 35 ) },
				{ t : 20550 , p : new CANNON.Vec3( 20 , 50 , 20 ) },
				{ t : 23450 , p : new CANNON.Vec3( 10 , 51 , 22 ) },
				{ t : 23680 , p : new CANNON.Vec3( 11 , 48 , 28 ) },
				{ t : 24400 , p : new CANNON.Vec3( sceneSize.x / 2 +21 , sceneSize.y / 2 , 0 ) },
				{ t : 25300 , p : new CANNON.Vec3( sceneSize.x / 2  , sceneSize.y / 2 , -50 ) },
				{ t : 26460 , p : new CANNON.Vec3( -20 , sceneSize.y / 2 , 0 ) },
				{ t : 27360 , p : new CANNON.Vec3( 40 , 70 , 23 ) },
				{ t : 29360 , p : new CANNON.Vec3( 40 , 70 , 43 ) },
				{ t : 31000 , p : new CANNON.Vec3( sceneSize.x / 2 , 2 , 53 ) },
				{ t : 33000 , p : new CANNON.Vec3( sceneSize.x / 2 , 5 , 33 ) },
				{ t : 34000 , p : new CANNON.Vec3( sceneSize.x / 2 , 5 , 33 ) },
				{ t : 35000 , p : new CANNON.Vec3( sceneSize.x / 2 + 10 , 10 , 0 ) },
				{ t : 36000 , p : new CANNON.Vec3( 0 , 10 , -50 ) },
				{ t : 37300 , p : new CANNON.Vec3( -10 , 10 , 0 ) },
				
				{ t : 39000 , p : new CANNON.Vec3( sceneSize.x / 2 , 38 , 60 ) },
				{ t : 50000 , p : new CANNON.Vec3( 70 , 38 , 0 ) },
				{ t : 58000 , p : new CANNON.Vec3( sceneSize.x / 2 , 38 , 70 ) },
				{ t : 66000 , p : new CANNON.Vec3( -20 , 38 , 0 ) },
				{ t : 74000 , p : new CANNON.Vec3( sceneSize.x / 2 , 38 , 70 ) },
			]);
			
			
			var s = '{';
			s += '"camTween":[';
			for( var i = 0 ; i < cp.length ; i ++ )
				s+='{"t":'+cp[i].t+',"p":{"x":'+cp[i].p.x+',"y":'+cp[i].p.y+',"z":'+cp[i].p.z+'}},';
			s = s.substr( 0 , s.length-1  )+'],';
			
			s += '"lookAtTween":[';
			for( var i = 0 ; i < lookAtTween.length ; i ++ )
				s+='{"t":'+lookAtTween[i].t+',"p":{"x":'+lookAtTween[i].p.x+',"y":'+lookAtTween[i].p.y+',"z":'+lookAtTween[i].p.z+'}},';
			s = s.substr( 0 , s.length-1  )+']';
			s+='}';
			console.log( s );
			
			
			camTween = new Array( cp.length );
			for( var i = 0 ; i < camTween.length ; i ++ ){
				camTween[ i ] = {
					t : cp[ i ].t,
					p : new THREE.Vector3( cp[ i ].p.x / ratioVisual , cp[ i ].p.y / ratioVisual , cp[ i ].p.z / ratioVisual )
				}
			}
			
			for( var i = 0 ; i < lookAtTween.length ; i ++ ){
				lookAtTween[ i ] = {
					t : lookAtTween[ i ].t,
					p : new THREE.Vector3( lookAtTween[ i ].p.x / ratioVisual , lookAtTween[ i ].p.y / ratioVisual , lookAtTween[ i ].p.z / ratioVisual )
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
		
		
		
	} )(  this );
	
	


