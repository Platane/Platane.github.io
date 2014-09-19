var contentIllustrationActions = (function(){

	// alias
	var dom = DomHelper
	

	

	var _preparePanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			nav = main.querySelector('.work-nav')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			navWidth = nav.offsetWidth,
			panelWidth = mainWidth - navWidth - 50 

		// set as fixed
		content.style.width = contentWidth+'px'
		panel.style.width = panelWidth+'px'
	}
	var _finishPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel')
			
		//unfix
		content.style.width = panel.style.width = ''
	}
	
	var openIlluPanel = function( main ){
		
		var contentWrapper = main.querySelector('.work-content-wrapper')

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

		var contentWrapper = main.querySelector('.work-content-wrapper')

		dom.removeClass( main , 'illu-displayed' )


		dom.unbind( contentWrapper , 'click.close' )


		// clear stuff on animation end
		dom.bind( contentWrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' , function(){
			// TODO
			_finishPanel( main )

			dom.unbind( contentWrapper , 'transitionEnd.clear-after-out-anim webkitTransitionEnd.clear-after-out-anim' )
		})
	}

	var changeIllu = function( main , url , caption , noTransition ){
		
		var primarIllu = main.querySelector('.work-illu-primar div'),
			captionSpan = main.querySelector('.work-illu-caption')

		primarIllu.style.backgroundImage = 'url('+url+')'
		captionSpan.innerHTML = caption ||''
	}

	
	var miniatures = document.querySelectorAll( '.work-illu.work-illu-secondary' )
	for(var i=miniatures.length;i--;){
		dom.bind( miniatures[i] , 'click.emphase-illu' , function( e ){
			
			// grab the main element
			var main = dom.getParent( this , 'work-main' )


			// is the panel already opened?
			if( !dom.hasClass( main , 'illu-displayed')  ){
				// no, open the panel
				openIlluPanel( main )

				// change immediatly
				changeIllu( main , this.getAttribute( 'data-image' ) , this.getAttribute( 'data-caption' ) , true )
			}
			else
			{
				// yes, just set the picture

				// change the image if different
				changeIllu( main , this.getAttribute( 'data-image' ) , this.getAttribute( 'data-caption' ) )

			}
		})

		// set the illu for the first time
		changeIllu( dom.getParent( miniatures[i] , 'work-main' ) , miniatures[i].getAttribute( 'data-image' ) , miniatures[i].getAttribute( 'data-caption' ) , true )
	}

	
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



	
	