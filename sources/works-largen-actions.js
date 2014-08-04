var worksActions = (function(){

	// alias
	var dom = DomHelper

	// store the last opened tile
	var opened = null;

	var openWork = function( tile ){
		// reset all the previous
		if( opened == tile )
			return

		closeWork();
		
		dom.addClass( tile , 'grid-tile-large')
		gridLayout.update();

		opened = tile

		//bind close actions
		dom.bind( document , 'click.out-side-tile' , function( e ){
			if( dom.hasClass( e.target , 'tile' ) || dom.getParent( e.target , 'tile' ) )
				return
			closeWork();
		})
	}
	var closeWork = function( tile ){

		if( !opened )
			return

		dom.removeClass( opened , 'grid-tile-large')
	
		gridLayout.update();

		dom.unbind( document , 'click.out-side-tile' );

		opened = null;
	}

	// bind open action
	var DOMworks = document.querySelectorAll('.work');
	for(var i=DOMworks.length;i--;)

		dom.bind( DOMworks[i] , 'click.open' ,function(){
			openWork( dom.getParent( this , 'tile' ) )
		})

	return {
		open : openWork,
		close : closeWork,
	}
	
})()