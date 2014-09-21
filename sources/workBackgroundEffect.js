;(function(){

	var heroes = document.querySelectorAll( '.work-illu-main div' )

	for(var i=heroes.length;i--;){
		var neat = heroes[i].style.backgroundImage

		var plusEffect = [
			'',
			'-webkit-radial-gradient(65% 50%,ellipse cover,rgba(0,0,0,0) 52%,rgba(60, 60, 60, 1) 104%),',
			'-msie-radial-gradient(65% 50%,ellipse cover,rgba(0,0,0,0) 52%,rgba(60, 60, 60, 1) 104%),',
			'-moz-radial-gradient(65% 50%,ellipse cover,rgba(0,0,0,0) 52%,rgba(60, 60, 60, 1) 104%),',
			'radial-gradient(65% 50%,ellipse cover,rgba(0,0,0,0) 52%,rgba(60, 60, 60, 1) 104%),',
		]

		for(var k=plusEffect.length;k--;)
			plusEffect[k] = 'background-image:' + plusEffect[k] + neat +';'

		heroes[i].setAttribute('style', plusEffect.join('') )
	}

})()