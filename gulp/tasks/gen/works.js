var   gulp = require('gulp')
    , rename = require('gulp-rename')
    , templating = require('./templating')
    , markdown = require('markdown').markdown
    , htmlmin = require('gulp-html-minifier')


var prepareData = function( data ){
    data.works = data.works
    .map(function(w){
        w['sum-up'] = markdown.toHTML( w['sum-up'] )

        w['illustration-main'] = w['screenShots'][0]
        w['illustration-second'] = []
        for(var i=1;i<w['screenShots'].length;i++)
            w['illustration-second'].push( w['screenShots'][i] );


        w['rank'] = w['coolness'] * w['weight']
        w['rank'] = Math.random()

        w['id'] = w['title'].split(' ').join('-')

        return w
    })
    .sort(function(a,b){
        return a.rank < b.rank ? 1 : -1
    });
    return data
}

gulp.task('gen.works', function() {
    
    templating( '../build/templates/works.html' , '../build/data/works.json' , prepareData )
    .pipe( htmlmin() )
    .pipe( rename('works.html') )
    .pipe( gulp.dest('../build/') )

});