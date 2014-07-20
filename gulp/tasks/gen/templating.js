var   gulp = require('gulp')
    , Mustache = require('mustache')
    , path = require('path')
    , Stream = require('stream').Stream
    , File = require('vinyl')

var templates = {};

module.exports = function( templateSrc , dataSrc , prepareData ){

    var stream = new Stream()
    stream.setMaxListeners(0) // allow adding more than 11 streams
    stream.writable = stream.readable = true
    
    prepareData = prepareData || function(r){return JSON.parse( r )}

    var template,data,basePath,cwdPath,ended=false;

    var mustachify = function(){
        if( !template || !data || ended )
            return;

        var output = Mustache.render( template , prepareData( data ) );

        ended = true

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
            templates[ templateSrc ] = template = d.contents.toString('utf8');
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