var gulp = require('gulp')
  , concat = require('gulp-concat')
  , Stream = require('promisableStream')
  , uglify = require('gulp-uglify')

var uid =0;

var readBundle = function(htmlString){

  var lines = htmlString.split(/\n/)
  var m, i

  for (i=0; i<lines.length; i++)
    if( (m=lines[i].match(/[\t ]*<!-- *make *bundle *\[ *([^\]]+) *\] *-->/)) )
      break

  if (i>=lines.length)
    return

  var bundleName = m.concat( './bundle'+(uid++) )[1]
  var dep = []

  for (;i<lines.length;i++){
    if( (m=lines[i].match(/[\t ]*<!-- *end *bundle *-->/)) )
      break
    if( (m=lines[i].match(/src="([^"]+)"/)) )
      dep.push(m[1])
  }

  return {
    name: bundleName,
    dep: dep
  }
}

var bundleJs = function(options){

  options = options || {}

  var stream = new Stream()
  stream.writable = stream.readable = true

  var pending = 0

  stream.write = function( file ){
    var o
    if ( !(o=readBundle(file.contents.toString('utf8'))) || !o.dep.length )
        return

    file.path
    var path = options.path

    pending ++

    gulp.src( o.dep.map(function(l){return path+'/'+l }) )
    .pipe( concat( o.name ) )
    .on('data', stream.emit.bind( stream, 'data') )
    .on('end', function(){
       pending --
       stream.end()
    })
  }
  stream.end = function(){
    if(pending)
      return
    this.emit('end')
  }

  return stream
}

gulp.task('build.js', function() {

  uid = 0

  gulp.src('../sources/**/*.html')
    .pipe(bundleJs({
        path: '../sources/'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('../build/'));

    gulp.src('../sources/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('../build/'));

});
