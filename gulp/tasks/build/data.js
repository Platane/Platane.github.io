var es = require('event-stream')
  , gulp = require('gulp')

var concat =  function(opts){

  var d = function( data , callback ){

    var str = data.contents.toString('utf8');
    
    str = beautify( str , opts )

    data.contents = new Buffer( str );

    callback( null , data );
  };

  return es.map(beautifyData);
};

gulp.task('build-data', function() {
  gulp.src('../sources/works/')
    .pipe(concat())
    .pipe(gulp.dest('../build/works/'))
});

gulp.run('build-data')