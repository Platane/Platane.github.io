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
		dom.bind( document , 'click.outside-tile' , function( e ){
			if( dom.hasClass( e.target , 'work' ) || dom.getParent( e.target , 'work' ) )
				return
			closeWork();
		})
	}
	var closeWork = function( tile ){

		if( !opened )
			return

		dom.removeClass( opened , 'grid-tile-large')
	
		gridLayout.update();

		dom.unbind( document , 'click.outside-tile' );

		opened = null;
	}

	// bind open action
	var DOMworks = document.querySelectorAll('.work');
	for(var i=DOMworks.length;i--;)

		dom.bind( DOMworks[i] , 'click.open' ,function( e ){
			openWork( dom.getParent( this , 'grid-tile' ) )
			e.stopPropagation()
		})

	return {
		open : openWork,
		close : closeWork,
	}
	
})()