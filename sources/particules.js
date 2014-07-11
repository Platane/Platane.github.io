(function(){


var transformProp = ['webkitTransform']

var length = function(v){
	return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z)
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

		return this;
	},

	updatePhysic : function(){

	},

	draw : function(){

		var value = "translate3d(" + this.pos.x + "px," + this.pos.y + "px," + this.pos.z + "px)"

		for( var i=transformProp.length;i--;)
			this._dom.style[ transformProp[i] ] = value
	}

}
Leaf.create=function( img , position , rotation , dimension , parent ){
	return (new Leaf()).init().build( img , dimension , parent ).prepare( position , rotation );
}


var l = Leaf.create( null , {x:500,y:500,z:0} , {x:0,y:0,z:0,w:0} , {x:10,y:10} )

l.draw();

})();