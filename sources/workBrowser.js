(function(){

	var hasClass = function( el , c ){
		return el.className.indexOf(c)>=0
	}
	var addClass = function( el , c ){
		el.className += ' '+c
	}
	var removeClass = function( el , c ){
		el.className = el.className.split( c ).join('')
	}
	var getParent = function( el , c ){
		while(true)
			if( el !== document && !hasClass( el , c ) )
				el = el.parentElement
			else
				break;
		return el === document ? null : el
	}

	var all = document.querySelectorAll( '.work-illu.work-illu-secondary' )




	var onAnimationOpenEnd = function(e){

		

		this.removeEventListener( 'webkitTransitionEnd' , onAnimationOpenEnd , false )
		this.removeEventListener( 'transitionEnd' , onAnimationOpenEnd , false )
		this.removeEventListener( 'webkitTransitionEnd' , onAnimationCloseEnd , false )
		this.removeEventListener( 'transitionEnd' , onAnimationCloseEnd , false )
	}
	var onAnimationCloseEnd = function(e){

		this.style.height = ''
		this.querySelector('.work-illu').style.width = ''
		
		this.removeEventListener( 'webkitTransitionEnd' , onAnimationOpenEnd , false )
		this.removeEventListener( 'transitionEnd' , onAnimationOpenEnd , false )
		this.removeEventListener( 'webkitTransitionEnd' , onAnimationCloseEnd , false )
		this.removeEventListener( 'transitionEnd' , onAnimationCloseEnd , false )
	}
	var openIlluPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			nav = main.querySelector('nav'),
			primarIllu = panel.querySelector('.work-illu')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			panelWidth = mainWidth * 0.70,
			contentHeight = content.offsetHeight,
			navHeight = nav.offsetWidth


		// set as fixed
		content.style.width = contentWidth+'px'
		primarIllu.style.width = panel.style.width = panelWidth+'px'
		panel.style.height = Math.max( contentHeight , navHeight )+'px'

		addClass( main , 'illu-displayed' )


		// clear stuff on animation end
		panel.addEventListener( 'webkitTransitionEnd' , onAnimationOpenEnd , false )
		panel.addEventListener( 'transitionEnd' , onAnimationOpenEnd , false )
		
	}

	var closeIlluPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel'),
			nav = main.querySelector('nav')


		// set as fixed
		content.style.width = ''
		panel.style.width = ''
		

		removeClass( main , 'illu-displayed' )

		// clear stuff on animation end
		panel.addEventListener( 'webkitTransitionEnd' , onAnimationCloseEnd , false )
		panel.addEventListener( 'transitionEnd' , onAnimationCloseEnd , false )
	}

	var changeIllu = function( current , url , noTransition ){
		current.style.backgroundImage = 'url('+url+')'
	}

	

	for(var i=all.length;i--;)
		all[i]
		.addEventListener('click',function( e ){
			
			// grab the main element
			var main = getParent( this , 'work-main' ),
				primarIllu = main.querySelector('.work-illu-primar div')

			if( !hasClass( main , 'illu-displayed')  ){
				// open the panel


				openIlluPanel( main )

				changeIllu( primarIllu , this.getAttribute( 'data-image' ) , true )
			}
			else
			{
				
				closeIlluPanel( main )

				// change the image if different
				changeIllu( primarIllu , this.getAttribute( 'data-image' )  )

			}
			e.stopPropagation();
			


		})
})()