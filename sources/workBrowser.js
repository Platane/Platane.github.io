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

	var openIlluPanel = function( main ){
		var content = main.querySelector('.work-content'),
			panel = main.querySelector('.work-illu-panel')

		var contentWidth = content.offsetWidth,
			mainWidth = main.offsetWidth,
			panelWidth = mainWidth * 0.70


		// set as fixed
		content.style.width = contentWidth+'px'
		panel.style.width = panelWidth+'px'

		addClass( main , 'illu-displayed' )
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
				// change the image if different
				changeIllu( primarIllu , this.getAttribute( 'data-image' )  )

			}
			e.stopPropagation();
			
		})
})()