var contentIllustrationActions = (function(){

	// alias
	var dom = DomHelper
	

	

	var _preparePanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			primarIllu = panel.querySelector('.work-illu')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			mainHeight = main.offsetHeight,
			panelWidth = mainWidth * 0.70

		// set as fixed
		content.style.width = contentWidth+'px'
		primarIllu.style.width = panelWidth+'px'
		panel.style.height = mainHeight+'px'
	}
	var _finishPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			primarIllu = panel.querySelector('.work-illu'),
			wrapper = main.querySelector('.work-content-wrapper')

		//unfix
		wrapper.style.width = content.style.width = panel.style.height = panel.style.width = primarIllu.style.width = ''
	}
	
	var openIlluPanel = function( main ){
		
		var content = main.querySelector('.work-content'),
			wrapper = main.querySelector('.work-content-wrapper')

		_preparePanel( main )

		dom.addClass( main , 'illu-displayed' )

		// in case the wrapper width is fixed
		wrapper.style.width = ''

		// clear stuff
		dom.unbind( wrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )

		// prepare close action
		// sorry for the set timeout
		dom.unbind( content , 'click.close' )
		window.setTimeout( 
			function(){
				dom.bind( content , 'click.close' , function(){
					closeIlluPanel( main )
				})
			}
			,100
		)
	}

	var closeIlluPanel = function( main ){

		var content = main.querySelector('.work-content'),
			wrapper = main.querySelector('.work-content-wrapper')

		dom.removeClass( main , 'illu-displayed' )


		dom.unbind( content , 'click.close' )


		wrapper.style.width = ''

		// clear stuff on animation end
		dom.bind( wrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' , function(){
			// TODO
			_finishPanel( main )

			dom.unbind( wrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )
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




	var contents = document.querySelectorAll( '.work-content-long' )
	for(var i=contents.length;i--;)
		dom.bind( contents[i] , 'mousedown.drag' , function( e ){
				
			// grab elements
			var content = this,
				main = dom.getParent( content , 'work-main'),
				panel = main.querySelector('.work-illu-panel'),
				illu = panel.querySelector('.work-illu'),
				wrapper = main.querySelector('.work-content-wrapper')

			// compute the grab
			var xMouseStart = e.pageX,
				wContentStart = dom.getWidth( wrapper )

			// prepare the panel ( set the value to animate ), but leave the panel with the same width
			_preparePanel( main )
			wrapper.style.width = wContentStart +'px'

			//
			dom.addClass( wrapper , 'dragged')
			dom.addClass( panel , 'dragged')


			// will detect simple click from draging
			var startTime = new Date().getTime()

			//
			dom.bind( window , 'mousemove.dragging' , function(e){
				var x = e.pageX
				wrapper.style.width = Math.max( 0 , wContentStart + ( xMouseStart - x ))+'px'
			})
			dom.bind( window , 'mouseup.dragging' , function(e){

				//
				dom.removeClass( wrapper , 'dragged')
				dom.removeClass( panel , 'dragged')

				// 
				dom.unbind( window , 'mouseup.dragging' )
				dom.unbind( window , 'mousemove.dragging' )

				// its a click
				if( new Date().getTime() - startTime < 300 )
					return

				// if the width is large enougth, open up ; else close
				if( dom.getWidth( wrapper ) < dom.getWidth( illu )*0.5 )
					openIlluPanel( main )
				else
					closeIlluPanel( main )
			})
		})
})()



	
	