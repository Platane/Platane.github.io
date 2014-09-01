var   gulp = require('gulp')
    , rename = require('gulp-rename')
    , templating = require('./templating')
    , htmlmin = require('gulp-html-minifier')
    , cloudMaker = require('cloudMaker')



var parseDate = function( s ){
    var m = s.split('/')
    return  new Date( parseInt( m[2] ) , parseInt( m[1] )-1 , parseInt( m[0] ) )
}
var formateWhen=function( from , to ){
    if( typeof(from) == 'string' )
        from = parseDate( from )
    if( typeof(to) == 'string' )
        to = parseDate( to )

    var length = Math.max( 1 , Math.round( ( to.getTime() - from.getTime() ) / 1000/60/60/24/30 ) )

    if( length > 12 )
        return from.getFullYear() + ' - ' + to.getFullYear()

    return from.getFullYear() +'<span class="info"> ('+length+ ' month'+( length>1 ? 's' : '' )+')</span>'
}
var prepareData = function( data ){
        
    data=JSON.parse( data )

    ///// header

    // name
    if( !data.header.firstName || !data.header.lastName ){
        var m=data.header.name.trim().split(' ')
        data.header.firstName = m.slice(0,-1).join(' ')
        data.header.lastName = m.slice(-1).join(' ')
    }
    
    // age
    if( !data.header.age ){
        data.header.age = Math.floor( ( new Date().getTime() - parseDate( data.header.birthDate ).getTime() )/1000/60/60/24/365.24 )
    }


    ///// training

    // build the when label
    data.training.map(function( tr ){

        tr.when = formateWhen( tr.from , tr.to )

        return tr
    })

    // sort 
    data.skills = data.skills.sort(function(a,b){
        return ( a.power + a.relevance * 0.3 ) > ( b.power + b.relevance * 0.3 ) ? 1 : -1
    })

    // the tag cloud
    var words = [],
        weights = []

    for( var i=data.skills.length;i--;){
        words[i] = data.skills[i].tag
        weights[i] = data.skills[i].power + data.skills[i].relevance * 0.3 + Math.sqrt(i) * 0.05
    }
    data.skillCloud = cloudMaker( words , weights , {'line-height':'0.9em' , 'font-family' : 'consolas' } , {x:230,y:250} )


    ///// xp

    // sort
    data.xp.sort(function(a,b){
        return parseDate( a.from ) < parseDate( b.from ) ? 1 : -1
    })

    // build the when label
    data.xp.map(function( xp ){

        xp.when = formateWhen( xp.from , xp.to )

        return xp
    })


    ///// stamp
    data.build = new Date().getTime()

    return data
}

gulp.task('gen.cv', function() {
    
    templating( '../sources/templates/cv.html' , '../build/data/cv.json' , prepareData )
    .pipe( htmlmin() )
    .pipe( rename('cv.html') )
    .pipe( gulp.dest('../build/') )

});