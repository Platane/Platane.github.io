(function(){


var transformProp = ['webkitTransform' , 'mozTransform' , 'transform' ]

var lengthVector = function(v){
	return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
}
var normalizeVector = function(v){
	var l = lengthVector( v )
	v.x /= l
	v.y /= l
	v.z /= l
	return v
}
var decomposeQuaternion = function(q){
	var l = length( q )
}

var Leaf = function(){};
Leaf.prototype={

	build : function( img , dimension , parent ){

		this._dom = document.createElement('div');
		this._dom.setAttribute("class" , "particules-leaf");
		( parent || document.getElementsByTagName("body")[0] ).appendChild( this._dom )

		this._dom.style.width = dimension.x+"px";
		this._dom.style.height = dimension.y+"px";


		return this;
	},

	init : function( ){

		return this;
	},

	prepare : function( position  ,  rotation  ){

		this.pos = position
		this.rot = rotation

		this.v = {x:0.1,y:0,z:0}

		return this;
	},

	updatePhysic : function( dt ){


		// smooth fall

		var decrochage = -0.2

		

		var l = lengthVector( this.v )

		this.v.x /= l
		this.v.y /= l
		this.v.z /= l

		if( this.v.y > decrochage ){
				
			this.v.y-=0.01

		}else{

			this.v.y= - decrochage * 2
			this.v.x = -this.v.x
		}


		normalizeVector( this.v )

		this.v.x *= l
		this.v.y *= l
		this.v.z *= l

		// 
		this.pos.x += this.v.x * dt
		this.pos.y += this.v.y * dt
		this.pos.z += this.v.z * dt

		this.rot.y += 0.001 * dt
	},



	draw : function(){

		var value = "translate3d(" + this.pos.x + "px," + this.pos.y + "px," + this.pos.z + "px)"

		value += " rotateX(" + this.rot.x + "rad)"
		value += " rotateY(" + this.rot.y + "rad)"
		value += " rotateZ(" + this.rot.z + "rad)"

		for( var i=transformProp.length;i--;)
			this._dom.style[ transformProp[i] ] = value
	}

}


Leaf.create=function( img , position , rotation , dimension , parent ){
	return (new Leaf()).init().build( img , dimension , parent ).prepare( position , rotation );
}


var l = Leaf.create( null , {x:500,y:700,z:0} , {x:0,y:0,z:0,w:0} , {x:50,y:50} )

l.draw();

var start = new Date().getTime();
(function cycle(){

	var now = new Date().getTime()

	l.updatePhysic( now - start );
	l.draw();

	start = now 
	window.requestAnimationFrame( cycle )
})();


})();