
var   gulp = require('gulp')
    , path = require('path')
    , Stream = require('promisableStream')
    , File = require('vinyl')
    , rename = require('gulp-rename')
    , Promise = require('promise')

var getArticleUrl = function( info ){
  return '/build/articles/'+info.title.split(' ').join('-')+'.html'
}
var concatData = function( newName ){

    newName = newName || 'concat.json'

    var stream = new Stream()
    stream.writable = stream.readable = true

    var list=[]

    var cwdPath,basepath

    stream.write = function( file ){

        cwdPath = file.cwd

        try{
            var data = JSON.parse( file.contents.toString('utf8') )
            data.dir = path.normalize( file.path ).split('\\')
            data.dir = data.dir[ data.dir.length-2 ]
            
            data.url = getArticleUrl( data )

            list.push( data )
        }catch( e ){
            console.log( "enbale to read json from "+file.path+" content ignored ["+e+"]")
            return
        }

        if( !basepath )
          basepath = file.base
        else{
          var comon = path.normalize( basepath ).split('/'),
              current = path.normalize( file.base ).split('/'),
              i
          for(i=0;i<comon.length && comon[i]==current[i] ; i++ );

          basepath = comon.slice(0,i).join('/')
        }
    }
    stream.end = function( ){
        
        if( basepath)
            stream.emit('data',new File({
                contents : new Buffer( JSON.stringify({
                    articles : list.sort(function(a,b){return a.published<b.published ? -1 : 1}),
                    build : new Date().getTime()
                }) ),
                base: basepath,
                path: path.join( basepath , newName ),
                cwd: cwdPath,
            }));
        stream.emit('end')
    }

    return stream
}


var articlesBuild = '../build/data/articles/',
    articlesSources = '../sources/data/articles/'


gulp.task('build.articles', function() {
    
    return gulp.src( articlesSources+'/**/*')
    .pipe(gulp.dest( articlesBuild ))
    .toPromise()
});

gulp.task('build.articles-index' , function() {
    
    return gulp.src( articlesBuild+'**/data.json'  )
    .pipe( concatData() )
    .pipe( rename('articles.json') )
    .pipe( gulp.dest('../build/data/') )
    .toPromise()
});
