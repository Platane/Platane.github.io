var   gulp = require('gulp')
    , rename = require('gulp-rename')
    , templating = require('./templating')
    , markdown = require('markdown').markdown
    , htmlmin = require('gulp-html-minifier')
    , Color = require('color')


var prepareData = function( data ){
        
    data=JSON.parse( data )

    data.works = data.works
    .map(function(w){
        var shrink = w['sum-up'].split('\n').slice(0,4).join('\n')
        w['sum-up'] = markdown.toHTML( w['sum-up'] )
        w['shrink-sum-up'] = markdown.toHTML( shrink )

        w['illustration-second'] = []
        for(var i=0;i<w['screenShots'].length;i++){
            if( typeof w['screenShots'][i] === 'string' )
                w['illustration-second'].push( {'url' : w['screenShots'][i] } );
            else
                w['illustration-second'].push( w['screenShots'][i] );
        }

        w['illustration-main'] = w['illustration-second'][0]

        w['rank'] = Math.sqrt( w['coolness'] * w['weight'] ) *10
        //w['rank'] = Math.random() * 100

        w['height'] = Math.max( Math.min( Math.sqrt( (0.6+Math.random()*0.8) * w['rank'] )*1.2 , 10 ) , 4 )*45

        w['id'] = w['title'].split(' ').join('-')

        var color = Color().rgb( Math.random()*255 , Math.random()*255 , Math.random()*255 )
        w['color'] = color.rgbString()
        w['darkColor'] = color.clone().darken(0.5).rgbString()

        var lightColor = color.clone()
        lightColor.lightness(90)
        //lightColor.whiteness(0.9)

        w['lightColor'] = lightColor.rgbString()

        return w
    })
    /*
    .sort(function(a,b){
        return a.rank < b.rank ? 1 : -1
    });
    */
    .sort(function(a,b){
        return Math.random() < 0.5 ? 1 : -1
    });
    return data
}

gulp.task('gen.works', function() {
    
    templating( '../sources/templates/works.html' , '../build/data/works.json' , prepareData )
    .pipe( htmlmin() )
    .pipe( rename('works.html') )
    .pipe( gulp.dest('../build/') )

});