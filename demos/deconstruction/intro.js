// intro frames
(function( scope ){
	
	/*
	 *
	 * snippet from http://www.quirksmode.org/js/detect.html
	 */
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]	
};
BrowserDetect.init();

var init = function( container ){
	var speechBrowser = "I see that you use <b>"+BrowserDetect.browser+"</b>. ";
	switch( BrowserDetect.browser ){
		case "Chrome" :
			speechBrowser += "Good, the animation should run faster on it, enjoy !";
		break;
		case "Firefox" :
			speechBrowser += "Ok, it should work, but know that it run better on <b>Chrome</b>";
		break;
		default:
			speechBrowser += "The animation hasn't been tested on that browser, try it! But if it doen't work, consider use <b>Chrome</b> or <b>FireFox</b>";
		break;
	}
	var coll = {
		sitting : 		$("#sitting").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		sitting_on : 	$("#sitting-on").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		canap : 		$("#canap").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		sub1 : 			$("#sub1").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		sub2 : 			$("#sub2").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		caisse1 : 		$("#caisse1").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		caisse2 : 		$("#caisse2").css({ "position" : "absolute" , "top" : "-2000px" }).detach().appendTo( container ),
		text1 : 		$("<div>Hello, you are going to watch an awesome animation, there are a few recomandations</div>").css({ "position" : "absolute" , "top" : "-2000px" , "font-size" : "1.5em" }).addClass( "textFrame" ).attr("id" , "textFrame1" ).detach().appendTo( container ),
		text2 : 		$("<div>First, make your self confortable</div>").css({ "position" : "absolute" , "top" : "-2000px" , "font-size" : "1.5em"  }).addClass( "textFrame" ).attr("id" , "textFrame2" ).detach().appendTo( container ),
		text3 : 		$("<div>You should put your sound on, the animation is much greater with its music</div>").css({ "position" : "absolute" , "top" : "-2000px" , "font-size" : "1.5em" }).addClass( "textFrame" ).attr("id" , "textFrame3" ).detach().appendTo( container ),
		text4 : 		$("<div>Louder!</div>").css({ "position" : "absolute" , "top" : "-2000px", "font-size" : "1.5em"  }).addClass( "textFrame" ).attr("id" , "textFrame4" ).detach().appendTo( container ),
		text5 : 		$("<div>"+speechBrowser+"</div>").css({ "position" : "absolute" , "top" : "-2000px", "font-size" : "1.5em"  }).addClass( "textFrame" ).attr("id" , "textFrame5" ).detach().appendTo( container ),
	};
}

var launch = function( container , callBack ){
	
	var w = container.width(),
		h = container.height();
	
	//scene 1000 * 800
	
	var ratio = Math.min( w/2000 , h/1400 );
	
	
	var coll = {
		sitting : 		$("#sitting"),
		sitting_on : 	$("#sitting-on"),
		canap : 		$("#canap"),
		text1 : 		$("#textFrame1" ),
		text2 : 		$("#textFrame2" ),
		text3 : 		$("#textFrame3" ),
		text4 : 		$("#textFrame4" ),
		text5 : 		$("#textFrame5" ),
		text6 : 		$("#textFrame6" ),
		sub1 : 			$("#sub1" ),
		sub2 : 			$("#sub2" ),
		caisse1 : 		$("#caisse1" ),
		caisse2 : 		$("#caisse2" ),
	};
	
	var resize = function( e ){
		
		var w = Math.round( e.width() * ratio ),
			h = Math.round( e.height() * ratio );
		e.attr( "width" , w+"px" ).attr( "height" , h+"px" ).css({ "width" : w+"px" , "height" : h+"px" });
	};
	
	for( var i in coll )
		resize( coll[ i ] );
	
	var currentFrame = 0;
	var gotoNext = function(){
		frame[ currentFrame ].finish();
		currentFrame ++;
		frame[ currentFrame ].setUp();
	}
	
	$("<div>skip >></div>").css({ "cursor" : "pointer" , "font-size" : "38px" , "position" : "absolute" , "top" : "70%" , "right" : "10%" }).appendTo( container );
	
	var frame = [
		
		//first frame
		{ setUp : function(){
				
				coll.sitting.css({"top" : "200px" , "left" : ( 900 * ratio )+"px" }).addClass("frame1");
				
				coll.text1.css({"top" : "100px" , "left" : ( 300 * ratio )+"px" }).addClass("frame1");
				coll.text1.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext );
			},
			finish : function(){
				coll.sitting.css({"top" : "-2000px" }).removeClass("frame1");
				coll.text1.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext ).css({"top" : "-2000px" }).removeClass("frame1");
			}
		},
		
		//second frame
		{ setUp : function(){
				
				coll.sitting.css({"top" : "200px" , "left" : ( 700 * ratio )+"px" });
				coll.sitting.addClass( "frame2" );
				
				coll.canap.css({"top" : "200px" , "left" : ( 700 * ratio )+"px" });
				coll.canap.addClass( "frame2" );
				
				
				coll.sitting_on.addClass( "frame2" );
				
				coll.canap.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , function(){
					coll.sitting_on.css({"top" : "200px" , "left" : ( 700 * ratio )+"px" });
					coll.canap.css({"top" : -2000+"px" }).removeClass("frame2");
					coll.sitting.css({"top" : -2000+"px" }).removeClass("frame2");
					coll.canap.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" );
				} );
				
				coll.text2.css({"top" : "100px" , "left" : ( 300 * ratio )+"px" });
				coll.text2.addClass("frame2");
				coll.text2.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext );
			},
			finish : function(){
				coll.sitting_on.css({"top" : -2000+"px" }).removeClass("frame2");
				coll.canap.css({"top" : -2000+"px" }).removeClass("frame2");
				coll.sitting.css({"top" : -2000+"px" }).removeClass("frame2");
				coll.canap.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" );
				coll.text2.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext ).css({"top" : -2000+"px" }).removeClass("frame2");
			}
		},
		
		//third frame
		{ setUp : function(){
				
				coll.sitting_on.css({"top" : "200px" , "left" : ( 700 * ratio )+"px" }).addClass( "frame3" );
				
				coll.sub1.css({"top" : "200px" , "left" : ( 100 * ratio )+"px" }).addClass("frame3");
				coll.caisse1.css({"top" : "200px" , "left" : ( 100 * ratio )+"px" }).addClass("frame3");
				
				coll.text3.css({"top" : "100px" , "left" : ( 300 * ratio )+"px" });
				coll.text3.addClass("frame3");
				coll.text3.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext );
				
				$("#sound_player_loop")[0].play();
			},
			finish : function(){
				coll.sitting_on.css({"top" : -2000+"px" }).removeClass("frame3");
				coll.sub1.css({"top" : -2000+"px" }).removeClass("frame3");
				coll.sub2.css({"top" : -2000+"px" }).removeClass("frame3");
				coll.caisse1.css({"top" : -2000+"px" }).removeClass("frame3");
				coll.caisse2.css({"top" : -2000+"px" }).removeClass("frame3");
				coll.text3.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext ).css({"top" : -2000+"px" }).removeClass("frame3");
			}
		},
		
		
		//fourth frame
		{ setUp : function(){
				
				
				coll.sitting_on.css({"top" : "200px" , "left" : ( 700 * ratio )+"px" }).addClass( "frame4" );
				
				coll.sub1.css({"top" : "200px" , "left" : ( 100 * ratio )+"px" }).addClass("frame4");
				coll.caisse1.css({"top" : "200px" , "left" : ( 100 * ratio )+"px" }).addClass("frame4");
				
				coll.sub2.css({"top" : "200px" , "left" : ( 1500 * ratio )+"px" }).addClass("frame4");
				coll.caisse2.css({"top" : "200px" , "left" : ( 1500 * ratio )+"px" }).addClass("frame4");
				
				
				coll.text4.css({"top" : "100px" , "left" : ( 300 * ratio )+"px" });
				coll.text4.addClass("frame4");
				//coll.text4.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext );
			},
			finish : function(){
				coll.sitting_on.css({"top" : -2000+"px" }).removeClass("frame4");
				coll.sub1.css({"top" : -2000+"px" }).removeClass("frame4");
				coll.sub2.css({"top" : -2000+"px" }).removeClass("frame4");
				coll.caisse1.css({"top" : -2000+"px" }).removeClass("frame4");
				coll.caisse2.css({"top" : -2000+"px" }).removeClass("frame4");
				coll.text4.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext ).css({"top" : -2000+"px" }).removeClass("frame4");
			}
		},
		
		//fourth frame
		{ setUp : function(){
				
				coll.sitting_on.css({"top" : "200px" , "left" : ( 1200 * ratio )+"px" }).addClass( "frame5" );
				
				coll.text5.css({"top" : "100px" , "left" : ( 300 * ratio )+"px" });
				coll.text5.addClass("frame5");
				coll.text5.bind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext );
			},
			finish : function(){
				coll.sitting_on.css({"top" : -2000+"px" }).removeClass("frame5");
				coll.text5.unbind( "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd" , gotoNext ).css({"top" : -2000+"px" }).removeClass("frame5");
			}
		},
		
		//last frame
		{ setUp : function(){
			container.children().remove();
			container.unbind( "click" , gotoNext );
			if( callBack )
				callBack.f.call( callBack.o );
			}
		}
	];
	
	container.bind( "click" , gotoNext );
		
	
	frame[ 0 ].setUp();
	
}

scope.inithAnimation = init;
scope.launchAnimation = launch;

})(this);

window.onload = function(){
	
	var preload = deconstruction.preload( $( "#container" ) )
	.then(function(){
		preload = true
	})
	.then(null,function(e){
		console.error(e.message,e.stack)
	})

	inithAnimation( $( "#container" ) );
	launchAnimation( $( "#container" ) , { 
		o : this ,
		f : function(){

			var start = function(){
				deconstruction.init()

				$("#sound_player_loop")[0].pause();
				$("#sound_player")[0] = $("#sound_player_loop")[0].currentTime = 0;
			
				$("#sound_player")[0].play(); 

				deconstruction.go()
			}

			// launch
			if( preload === true )
				start()
			else
				preload.then(start)

		}
	});


	$("#volumeControl").bind( "change" , function( e ){
		$("#sound_player")[0].volume = parseInt( e.target.value ) / 100;
		$("#sound_player_loop")[0].volume = parseInt( e.target.value ) / 100;
	});
	
	$("#muteBn").bind( "click" , function( e ){
		$("#volumeControl")[0].value = 0;
		$("#volumeControl").change();
	});
	
	$("#volumeControl")[0].value = 70;
	$("#volumeControl").change();

	//$("#sound_player")[0].volume = $("#sound_player_loop")[0].volume = 0
};