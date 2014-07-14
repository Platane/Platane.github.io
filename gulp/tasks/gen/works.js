var   gulp = require('gulp')
    , rename = require('gulp-rename')
    , templating = require('./templating')
    , markdown = require('markdown').markdown
    , htmlmin = require('gulp-html-minifier')


var prepareData = function( data ){
    data.works = data.works
    .map(function(w){
        var shrink = w['sum-up'].split('\n').slice(0,4).join('\n')
        w['sum-up'] = markdown.toHTML( w['sum-up'] )
        w['shrink-sum-up'] = markdown.toHTML( shrink )

        w['illustration-main'] = w['screenShots'][0]
        w['illustration-second'] = []
        for(var i=1;i<w['screenShots'].length;i++)
            w['illustration-second'].push( w['screenShots'][i] );


        w['rank'] = w['coolness'] * w['weight']
        w['rank'] = Math.random() * 100

        w['height'] = Math.max( Math.min( Math.sqrt( w['rank'] )*1.2 , 10 ) , 3.5 )*60

        w['id'] = w['title'].split(' ').join('-')

        return w
    })
    .sort(function(a,b){
        return a.rank < b.rank ? 1 : -1
    });
    return data
}

gulp.task('gen.works', function() {
    
    templating( '../sources/templates/works.html' , '../build/data/works.json' , prepareData )
    .pipe( htmlmin() )
    .pipe( rename('works.html') )
    .pipe( gulp.dest('../build/') )

});