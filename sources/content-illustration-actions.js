var contentIllustrationActions = (function(){

	// alias
	var dom = DomHelper
	

	

	var _preparePanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			nav = main.querySelector('nav'),
			primarIllu = panel.querySelector('.work-illu')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			mainHeight = main.offsetHeight,
			panelWidth = mainWidth * 0.70

		// set as fixed
		content.style.width = contentWidth+'px'
		primarIllu.style.width = panel.style.width = panelWidth+'px'
		panel.style.height = mainHeight+'px'
	}
	var _finishPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			nav = main.querySelector('nav'),
			primarIllu = panel.querySelector('.work-illu')

		//unfix
		content.style.width = panel.style.height = panel.style.width = primarIllu.style.width = ''
	}
	
	var openIlluPanel = function( main ){
		
		var content = main.querySelector('.work-content')

		_preparePanel( main )

		dom.addClass( main , 'illu-displayed' )


		// clear stuff
		dom.unbind( main , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )

		// prepare close action
		// sorry for the set timeout
		window.setTimeout( 
			function(){
				dom.bind( content , 'click.close' , function(){
					closeIlluPanel( main )
				})
			}
			,0
		)
	}

	var closeIlluPanel = function( main ){

		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel')

		dom.removeClass( main , 'illu-displayed' )


		dom.unbind( content , 'click.close' )


		panel.style.width = ''

		// clear stuff on animation end
		dom.bind( main , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' , function(){
			// TODO
			_finishPanel( main )

			dom.unbind( main , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )
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
				illu = panel.querySelector('.work-illu')

			// compute the grab
			var xMouseStart = e.pageX,
				xPanelStart = dom.getWidth( panel )

			// prepare the panel ( set the value to animate ), but leave the panel with the same width
			_preparePanel( main )
			panel.style.width = Math.max( 5, xPanelStart )

			//
			dom.addClass( content , 'dragged')
			dom.addClass( panel , 'dragged')

			//
			dom.bind( window , 'mousemove.dragging' , function(e){
				var x = e.pageX
				panel.style.width = Math.max( 0 , xPanelStart - ( xMouseStart - x ))+'px'
			})
			dom.bind( window , 'mouseup.dragging' , function(e){
				
				//
				dom.removeClass( content , 'dragged')
				dom.removeClass( panel , 'dragged')

				// if the width is large enougth, open up ; else close
				if( dom.getWidth( panel ) > dom.getWidth( illu )*0.5 )
					openIlluPanel( main )
				else{
					panel.style.width = ''
					closeIlluPanel( main )
				}
				


				// 
				dom.unbind( window , 'mouseup.dragging' )
				dom.unbind( window , 'mousemove.dragging' )
			})
		})
})()



	
	