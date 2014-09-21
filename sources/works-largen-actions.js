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

		//for animations
		// some css animation are triggered by the add of this class
		
		//reflow
		tile.offsetWidth

		dom.addClass( tile , 'grid-tile-large-opened')
	}
	var closeWork = function( tile ){

		if( !opened )
			return

		dom.removeClass( opened , 'grid-tile-large')
		dom.removeClass( opened , 'grid-tile-large-opened')
	
		gridLayout.update();

		dom.unbind( document , 'click.outside-tile' );

		if( contentIllustrationActions )
			contentIllustrationActions.close( opened.querySelector('.work-main') )

		opened = null;
	}

	// bind open action
	var DOMworks = document.querySelectorAll('.work');
	for(var i=DOMworks.length;i--;){

		dom.bind( DOMworks[i] , 'click.open' ,function( e ){
			openWork( dom.getParent( this , 'grid-tile' ) )
			e.stopPropagation()
		})


		dom.bind( DOMworks[i].querySelector('.work-close-button') , 'click.close-button' , function( e ) {
			closeWork( dom.getParent( this , 'grid-tile' ) )
			e.stopPropagation()
		})
	}

	return {
		open : openWork,
		close : closeWork,
	}
	
})()