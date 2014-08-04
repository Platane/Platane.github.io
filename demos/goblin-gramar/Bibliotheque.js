try{

function Bibliotheque( ) {
	
	var wordStock = [];
	
	
	if( typeof( Bibliotheque.initialized ) == "undefined" ){
		
		Bibliotheque.prototype.getWord = function( level ){
			
			if( typeof( this.books[level ]  ) == "undefined" )throw "this level of difficulty does not exist "+level;
			
			if(  this.books[level ].length == 0   )throw "ce level est vide "+level;
			
			var index = Math.floor( Math.random()*this.books[level ].length );
			
			var w = this.books[level ][ index ];
			
			this.books[level ].splice( index , 1 );
			
			return w;
		}
		
		
		/*
		 * contient les entrees
		 *
		 */
		Bibliotheque.prototype.books = {
			
			easy : [
				
				{ faux : "also your a pirate" , correct : "also you are a pirate" },
				{ faux : "beside ze point" , correct : "beside the point" },
				{ faux : "Cheerladder" , correct : "cheerleader" },
				{ faux : "did u know" , correct : "did you know" },
				{ faux : "such a goud day" , correct : "such a good day" },
				{ faux : "falling form the sky" , correct : "falling from the sky" },
				{ faux : "gimme the peper sauce" , correct : "give me the pepper sauce" },
				{ faux : "i am the baws" , correct : "i am the boss" },
				{ faux : "jock is on you" , correct : "joke is on you" },
				{ faux : "Kiling spree" , correct : "killing spree" },
				{ faux : "live me alone" , correct : "leave me alone" },
				{ faux : "my cat are the cutest" , correct : "my cat is the cutest" },
				{ faux : "no chocolat for you" , correct : "no chocolate for you" },
				{ faux : "one lemons" , correct : "one lemon" },
				{ faux : "pick me up on three" , correct : "pick me up at three" },
				{ faux : "restore defaut windows" , correct : "restore default windows" },
				{ faux : "sorry about dat" , correct : "sorry about that" },
				{ faux : "two aples" , correct : "two apples" },
				{ faux : "u gotta be kiddin me" , correct : "you have got to be kidding me" },
				{ faux : "wat r u doin" , correct : "what are you doing" },
				{ faux : "y so serious" , correct : "why so serious" },
				{ faux : "i am stronger then iron" , correct : "i am stronger than iron" },
				{ faux : "i rather lemon then apple" , correct : "i rather lemon than apple" },
				{ faux : "people eat dognut" , correct : "people eat doughnut" },
				{ faux : "curved yellow fruit" , correct : "banana" },
				//{ faux : "our public schools" , correct : "ours public schools" }
			],
			
			medium : [
				
			]
		}
		
		
		
		
		
		
		
		
		Bibliotheque.initialized = true;
	}
	
}


}catch( e ){

	catchError( e );
}
