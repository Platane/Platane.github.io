

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





var debug = ( window && window.location ) ? window.location.search == "?debug=true" : false

// destruction procedure
var deconstruction = (function( scope ){
	
	/*
	 * param
	 *
	 */
	var dimEngineWorld = 50; //taille du monde CANNON
	
	/*
	 * var
	 *
	 */
	var scene , renderer , camera , bodies = [] , textures = {} , structure , container;
	var ratioVisual = 1,	//ratio taille du monde CANNON / taille fenêtre
		speedEngine = 1,
		sceneBox = null,
		ratio = null;		// ratio taille fene^tre / taille source
		
	var mirrorCubeCamera;
	
	var faceProjection = function( face ){
		
		var t = face[ 0 ].clone();
		
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
		var P_ = P.reverse(); 
		
		// calcul the new poly
		var face_ = new Array( face.length );
		for( var i = 0 ; i < face.length ; i ++ )
			face_[ i ] = P_.vmult( face[ i ].vsub( t ) );
		
		return { P : P , P_ : P_ , t : t , face_ : face_ };
	};
	
	
	/**
	 * abstract both rendered and phusical world
	 */
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
			
			var l = 1.2;
			
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
				//geometry.faces.push( new THREE.Face3( 0 , i , i-1 ) );
				
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
						new THREE.Vector2( ( OA.x * textureU_.x + OA.y * textureU_.y ) / nU , ( OA.x * textureV_.x + OA.y * textureV_.y ) / nV ) , 
						new THREE.Vector2( ( OB.x * textureU_.x + OB.y * textureU_.y ) / nU , ( OB.x * textureV_.x + OB.y * textureV_.y ) / nV ) , 
						new THREE.Vector2( ( OC.x * textureU_.x + OC.y * textureU_.y ) / nU , ( OC.x * textureV_.x + OC.y * textureV_.y ) / nV ) , 
						
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
						new THREE.Vector2( ( OA.x * textureU_.x + OA.y * textureU_.y ) / nU , ( OA.x * textureV_.x + OA.y * textureV_.y ) / nV ) , 
						new THREE.Vector2( ( OB.x * textureU_.x + OB.y * textureU_.y ) / nU , ( OB.x * textureV_.x + OB.y * textureV_.y ) / nV ) , 
						new THREE.Vector2( ( OC.x * textureU_.x + OC.y * textureU_.y ) / nU , ( OC.x * textureV_.x + OC.y * textureV_.y ) / nV ) , 
					
						] );
				}
			}
				
			geometry.verticesNeedUpdate = true
			geometry.elementsNeedUpdate = true
			geometry.normalsNeedUpdate = true
			geometry.buffersNeedUpdate = true
			geometry.uvsNeedUpdate = true

			geometry.computeFaceNormals()



			var visual = new THREE.Mesh( geometry, material );

			visual.updateMatrix();
			
			visual.castShadow = true;
			visual.receiveShadow = true;
			
			
			
			// create the CANNON body
			var h = re.P.vmult( new CANNON.Vec3( 0 , 0 , l*0.5 ) );
			
			



			
			
			
			
			shape = new CANNON.ConvexPolyhedron ( points , faces  );
			this.mass = this.surfasicMass * area( p );
			phy = new CANNON.Body( {mass:this.mass } );
			phy.addShape( shape )
			phy.position.copy( cm );
			
			
			this.visual = visual;
			this.phy = phy;
			
		},

		_buildPhy : function( points  ){

			var l = 2

			var re = faceProjection( points )

			// horizontal vector
			var h = re.P.vmult( new CANNON.Vec3( 0 , 0 , l*0.5 ) )

			// normal of the [ 0 1 ] edge DOT the [ 2 1 ] edge 
			var sens = ( re.face_[1].x - re.face_[0].x )*( re.face_[1].y - re.face_[2].y ) - ( re.face_[1].y - re.face_[0].y )*( re.face_[1].x - re.face_[2].x ) < 0


			var points = [];
			var center = new CANNON.Vec3(0,0,0)
			for( var i = 0 ;i < p.length ; i ++){
				points[ i            ] = new CANNON.Vec3( p[i].x + h.x , p[i].y + h.y , p[i].z + h.z )
				points[ i + p.length ] = new CANNON.Vec3( p[i].x - h.x , p[i].y - h.y , p[i].z - h.z )

				center.vadd( p[i] )
			}
			

				
			var faces = [[],[]];
			for( var i = 0 ;i < p.length ; i ++){
				faces[ 0 ].push( i + p.length * (sens) )
				faces[ 1 ].unshift( i + p.length * (!sens) )
			}
			
			for( var i = 0 ;i < p.length ; i ++)
				if( !sens )
					faces.push( [ i , i + p.length , (i+1)%p.length + p.length  , (i+1)%p.length ] );
				else
					faces.push( [ (i+1)%p.length , (i+1)%p.length + p.length , i + p.length , i ] );
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
			this.phy.shapes[0].computeWorldVertices( this.phy.position , this.phy.quaternion )
			var positions = this.phy.shapes[0].worldVertices

			var l = positions.length/2
			var p = []
			for( var i=l;i--; )
				p.push( new CANNON.Vec3(
					( positions[i].x + positions[i+l].x )/2,
					( positions[i].y + positions[i+l].y )/2,
					( positions[i].z + positions[i+l].z )/2
				))

			
			
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
				
				//body.visual.castShadow = true;
				//body.visual.receiveShadow = true;
				//body.visual.useQuaternion = true;
				
				body.attach();
				body.unableInteraction();
				
				
				pieces[ i ] = body;
			}
			
			
			
			// give implusion,
			
			// piston bluid
			var radius = 3;
			var pulse = 25;
			var up = 0.5;
			
			/*
			var points = [];
			var faces = [];
			points.push( re.P.vmult( new CANNON.Vec3( 0, 0 , sharpness * rayon ) ) );
			points.push( re.P.vmult( new CANNON.Vec3( Math.cos( 0 ) * rayon , Math.sin( 0 ) * rayon , 0 ) ) );
			
			for( var i = 1 ; i < nface ; i ++ ){
				points.push( re.P.vmult( new CANNON.Vec3( Math.cos( i * Math.PI*2 / nface ) * rayon , Math.sin( i * Math.PI*2 / nface ) * rayon , 0 ) ) );
				faces.push( [ 0 , i+1 , i ] );
			}
			faces.push( [ 0 , 1 , nface ] );
			*/


			var mass = 5, radius = 1.3;
            sphereShape = new CANNON.Sphere(radius);
            hardImpulser = new CANNON.Body({ mass: 10 });
            hardImpulser.addShape(sphereShape);
                
            hardImpulser.linearDamping = 0.9;
            
			
			var force = re.P.vmult( new CANNON.Vec3( 0, 0 , 1 ) );
			force.normalize();
			force = force.mult( 2 );
			
			hardImpulser.position = center.vadd( force.mult(-2) );
			hardImpulser.velocity = force.mult( pulse );
			
			scene.world.add( hardImpulser );
			
			// visual
			if( debug ){
				var mesh;
				var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors } );
				material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
				var sphere_geometry = new THREE.SphereGeometry( rayon * sharpness / ratioVisual  , 8 , 8 );
				mesh = new THREE.Mesh( sphere_geometry, material );
				
				bodies.push( { visual : mesh , phy : hardImpulser } );
				
				scene.add( mesh );
			}
			
			// plan to remove impulsion
			(function(){
				
				var engineTimeRenaming = 450;
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
	var initStructure = function( container , source , textures ){
		
		
		
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
				shininess : 28,
				map : texture,
				bumpMap: bump,
				bumpScale: 0.1,
				metal: false,

				transparent : true,
				opacity : 0.95,
				shading: THREE.FlatShading
			});

			//var objectMaterial = new THREE.MeshPhongMaterial( { color: 0x000000, ambient: 0x111111, specular: 0xffffff, metal: true } );


			var body = Body.create( p , material , p[1] , p[2].vsub( p[1] ) , p[0].vsub( p[1] ) );
			body.attach();
			body.disableInteraction();
			body.label = e.attr( "id" );
			
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
	};
	
	/*
	 * Set up the world and static object
	 *
	 */
	var initScene = function( container , source ) {
		
		// Renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha : true
		});
		renderer.setSize( container.width() , container.height() );
		renderer.shadowMapEnabled = true;
		container[0].appendChild( renderer.domElement );
		
		
		// Scene
		scene = new THREE.Scene();

		// Light
		
		var dirLight = new THREE.SpotLight( 0xffffff, 0, 0, Math.PI , 1 );
		dirLight.position.set( 500 , 1200 , 1500 );
		dirLight.target.position.set( 0, 200, 0 );
		scene.add( dirLight );

		dirLight.castShadow = true;

		dirLight.shadowMapWidth = 2048;
		dirLight.shadowMapHeight = 2048;

		var d = 50;

		dirLight.shadowCameraLeft = -d;
		dirLight.shadowCameraRight = d;
		dirLight.shadowCameraTop = d;
		dirLight.shadowCameraBottom = -d;

		dirLight.shadowCameraFar = 44500;
		dirLight.shadowCameraNear = 10;
		dirLight.shadowCameraFov = 50;
		dirLight.shadowBias = -0.0001;
		dirLight.shadowDarkness = 0.5;
		

		if( debug )
			scene.add( new THREE.DirectionalLightHelper(dirLight, 50 ) );

		var pointLight = new THREE.PointLight( 0xffffff, 0.5 , 0 );
		pointLight.position.set( 500, 550, 500 );
		scene.add( pointLight );
		
		if( debug )
			scene.add( new THREE.PointLightHelper(pointLight, 50 ) );
		


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
		phyGround = new CANNON.Body({mass:0});
		phyGround.addShape( shapeGround )
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
			
			
			var v = (new THREE.Vector3()).subVectors( view , position );
			
			var n = v.length();
			
			var y = new THREE.Vector3( 0 , 1 , 0 );
			var e = v.divideScalar( n );
			var g = new THREE.Vector3().crossVectors( e , y );
			g.normalize();
			
			var tdecL = decL * Math.max( 0.5 , n * ratioVisual  / 50 ); 
			
			
			var upPos = new THREE.Vector3().copy( position );
			upPos.addVectors( upPos , g.multiplyScalar(  posScreen.x * tdecL ) );
			upPos.addVectors( upPos , y.multiplyScalar(  posScreen.y * tdecL ) );
			
			
			camera.position.x = upPos.x;
			camera.position.y = upPos.y;
			camera.position.z = upPos.z;
			
			
			camera.lookAt( view );
			
		};
		
		
		scope.tweeny = tweeny;
		scope.initMotion = initMotion;
		
	} )( this );
	
	
	var preload = function( _container ) {

		container = _container

		var get = function( url ){
			return new Promise( function(resolve,rejected){

				var success = function( rep ){
				    if( rep.target.status != 200 || !rep.target.responseText.length  )
				        return rejected( rep.target )

				    if( rep.target.status == 200  )
				        return resolve( rep.target.responseText )
				}

				var error  = function( rep ){
				    rejected( rep );
				}

				var xhr = new XMLHttpRequest();
				xhr.open("get", url , true);
				xhr.addEventListener("error", error , false);
				xhr.addEventListener("abort", error , false);
				xhr.addEventListener("load", success , false);
				xhr.send();
			});
		};

		var extractResume = function(htmlString){

			var shear = function( htmlString , skip ){

				skip = skip || [
					"script",
					"title",
					"style",
					"meta",
					"link"
				]

				var start=0,
					end= 0

				for( var i = 0 ; i < skip.length ; i ++ ){
					
					start=0

					while( ( start = htmlString.indexOf( "<"+skip[ i ] , start ) ) != -1 ){
						
						var nextClosed = htmlString.indexOf( ">" , start)
						
						var nextAutoClosed = htmlString.indexOf( "/>" , start)
						
						if( nextAutoClosed > 0 && nextClosed == nextAutoClosed+1 ){
							// tag < ... />
							end = nextClosed+1;
						} else {
							end = htmlString.indexOf( "</"+skip[ i ]+">" , start );
							if( end == -1 )
								// can't fin the closing tag /!\
								end = nextClosed+1;
							else 
								end += ("</"+skip[ i ]+">").length
						}
						
						htmlString = htmlString.substring( 0 , start ) + htmlString.substring( end , htmlString.length );
					}
				}

				return htmlString
			}

			htmlString = htmlString.replace(/\&nbsp;/g , ' ')
			htmlString = htmlString.replace(/\&/g , 'a')
			htmlString = shear( htmlString )

			// happend the string to a node
			var container = document.createElement('div')
			container.innerHTML = htmlString

			return container.querySelector( '.resume' )
		};

		var promiseAllAsObject = function( set ){
			return new Promise(function(resolve,reject){

				var res = {};

				for(var i in set )
					(function(){
						var label = i
						set[ i ].then(function( data ){
							res[ label ] = data

							var finished=true
							for(var i in set)
								if( !res[i] )
									finished=false

							if(finished)
								resolve( res )
						},reject)
					})()
			})
		}

		var renderAllTextures = function( dom ){

			// happend the dom to the document ( mandatory )
			var container = document.createElement('div')
			//container.style.display = 'none'
			container.appendChild(dom)

			var body = document.getElementsByTagName('body')[0]
			body.appendChild(container)

			if( debug )
				body.style.overflow = 'visible'

			// forced reflow
			container.offsetWidth

			// grab the bricks
			var bricks = dom.querySelectorAll('.brick')

			// create the html2canvas promise
			var promises = {}
			var options = {}
			
			for(var i=bricks.length;i--;)
				promises[ bricks[i].getAttribute('id') ] = html2canvas( bricks[i] , options )

			
			// merge all the promises
			return promiseAllAsObject( promises )
		};

		// grab the file which contains the structure of the resume
		return get('/build/resume.html')

		// grab the resume from this file
		.then( extractResume )

		// save the structure
		// and start rendering the bricks on canvas
		.then(function( dom ){
			structure = $(dom)

			// start rendering the textures
			return renderAllTextures( dom )
		})

		// save the textures
		.then(function( _textures ){

			for( var i in _textures )
				textures[i] = _textures[i]

			if( debug )
				for( var i in textures )
					document.getElementsByTagName('body')[0].appendChild(textures[i])
		})
		
	};
	var init = function(){

		// compute the ratio container/world
		initRatio( container , structure );

		// bootstrap the scene
		initScene( container );
		initMotion( container );
		initBumpmap();

		// init the bodies ( need )
		initStructure( container , structure , textures );

	};
	var go = function(){

		lastTime = new Date().getTime();
		requestAnimFrame(main);
	};

	return {
		preload : preload,
		go : go,
		init : init,
		camera : camera
	}
			
	
})(  );







