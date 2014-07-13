var   gulp = require('gulp')
    , rename = require('gulp-rename')
    , Mustache = require('mustache')
    , markdown = require('markdown').markdown
    , es = require('event-stream')
    , path = require('path')
    , Stream = require('stream').Stream
    , File = require('vinyl')
    , htmlmin = require('gulp-html-minifier')

var templates = {};

var generateTemplate=function( templateSrc , dataSrc , prepareData ){

    var stream = new Stream()
    stream.setMaxListeners(0) // allow adding more than 11 streams
    stream.writable = stream.readable = true
    
    prepareData = prepareData || function(r){return r}

    var template,data,basePath,cwdPath;

    var mustachify = function(){
        if( !template || !data )
            return;

        var output = Mustache.render( template , prepareData( JSON.parse( data ) ) );

        stream.emit( 'data' , new File({
            contents : new Buffer( output ),
            base: basePath,
            path: path.join( basePath , 'output.html' ),
            cwd: cwdPath,
        }));
        stream.emit( 'end' );
    }

    templateSrc = path.normalize( templateSrc )
    dataSrc = path.normalize( dataSrc )

    if( templates[ templateSrc ] )
        template = templates[ templateSrc ]
    else
        gulp.src( templateSrc )
        .on('data' , function( d ){ 
            template = d.contents.toString('utf8');
            mustachify();
        })
        .on('end' , mustachify )
        .on('error' , function(e){
            stream.emit('error' , e )
        })

    gulp.src( dataSrc )
    .on('data' , function( d ){ 
        data = d.contents.toString('utf8');
        basePath = d.base
        cwdPath = d.cwd
        mustachify();
    })
    .on('end' , mustachify )
    .on('error' , function(e){
        stream.emit('error' , e )
    })

    return stream;
}

var prepareData = function( data ){
    data.works = data.works
    .map(function(w){
        w['sum-up'] = markdown.toHTML( w['sum-up'] )

        w['illustration-main'] = w['screenShots'][0]
        w['illustration-second'] = []
        for(var i=1;i<w['screenShots'].length;i++)
            w['illustration-second'].push( w['screenShots'][i] );


        w['rank'] = w['coolness'] * w['weight']

        return w
    })
    .sort(function(a,b){
        return a.rank < b.rank ? 1 : -1
    });
    return data
}

gulp.task('gen', function() {
    
    generateTemplate( '../sources/templates/works.html' , '../build/data/works.json' , prepareData )
    .pipe( htmlmin())
    .pipe( rename('works.html') )
    .pipe( gulp.dest('../build/') )

});