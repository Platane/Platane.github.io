var contentIllustrationActions = (function(){

	// alias
	var dom = DomHelper
	

	

	var _preparePanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			panelWrapper = panel.querySelector('.work-illu-panel-wrapper'),
			contentWrapper = main.querySelector('.work-content-wrapper')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			mainHeight = main.offsetHeight,
			panelWidth = mainWidth * 0.70

		// set as fixed
		content.style.width = contentWidth+'px'
		panel.style.width = panelWidth+'px'
		/* panel.style.height = mainHeight+'px' */
	}
	var _finishPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel')
			

		//unfix
		content.style.width = panel.style.width = ''
	}
	
	var openIlluPanel = function( main ){
		
		var content = main.querySelector('.work-content'),
			contentWrapper = main.querySelector('.work-content-wrapper')

		_preparePanel( main )

		dom.addClass( main , 'illu-displayed' )

		// clear stuff
		dom.unbind( contentWrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )

		// prepare close action
		// sorry for the set timeout
		dom.unbind( contentWrapper , 'click.close' )
		window.setTimeout( 
			function(){
				dom.bind( contentWrapper , 'click.close' , function(){
					closeIlluPanel( main )
				})
			}
			,100
		)
	}

	var closeIlluPanel = function( main ){

		var content = main.querySelector('.work-content'),
			contentWrapper = main.querySelector('.work-content-wrapper')

		dom.removeClass( main , 'illu-displayed' )


		dom.unbind( contentWrapper , 'click.close' )


		// clear stuff on animation end
		dom.bind( contentWrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' , function(){
			// TODO
			_finishPanel( main )

			dom.unbind( contentWrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )
		})
	}

	var changeIllu = function( current , url , noTransition ){
		current.style.backgroundImage = 'url('+url+')'
	}

	
	var miniatures = document.querySelectorAll( '.work-illu.work-illu-secondary' )
	for(var i=miniatures.length;i--;)
		dom.bind( miniatures[i] , 'click.emphase-illu' , function( e ){
			
			// grab the main element
			var main = dom.getParent( this , 'work-main' ),
				primarIllu = main.querySelector('.work-illu-primar div')


			// is the panel already opened?
			if( !dom.hasClass( main , 'illu-displayed')  ){
				// no, open the panel
				openIlluPanel( main )

				// change immediatly
				changeIllu( primarIllu , this.getAttribute( 'data-image' ) , true )
			}
			else
			{
				// yes, just set the picture

				// change the image if different
				changeIllu( primarIllu , this.getAttribute( 'data-image' )  )

			}
		})



	
	var contents = document.querySelectorAll( '.work-content-wrapper' )
	for(var i=contents.length;i--;)
		dom.bind( contents[i] , 'mousedown.drag' , function( e ){
				
			// grab elements
			var contentWrapper = this,
				main = dom.getParent( contentWrapper , 'work-main')

			// compute the grab
			var xMouseStart = e.pageX,
				wContentStart = dom.getWidth( contentWrapper )

			// prepare the panel ( set the value to animate ), but leave the panel with the same width
			_preparePanel( main )
			contentWrapper.style.width = wContentStart +'px'

			//
			dom.addClass( contentWrapper , 'dragged')


			// will detect simple click from draging
			var startTime = new Date().getTime()

			//
			dom.bind( window , 'mousemove.dragging' , function(e){
				var x = e.pageX
				contentWrapper.style.width = Math.max( 0 , wContentStart + ( xMouseStart - x ))+'px'
			})
			dom.bind( window , 'mouseup.dragging' , function(e){

				//
				dom.removeClass( contentWrapper , 'dragged')

				// 
				dom.unbind( window , 'mouseup.dragging' )
				dom.unbind( window , 'mousemove.dragging' )

				// unfix width
				contentWrapper.style.width = ''

				// its a click
				if( new Date().getTime() - startTime < 300 )
					return

				// if the width is large enougth, open up ; else close
				if( dom.getWidth( contentWrapper ) < 200 )
					openIlluPanel( main )
				else
					closeIlluPanel( main )
			})
		})

})()



	
	