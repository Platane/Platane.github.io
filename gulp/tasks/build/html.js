var gulp = require('gulp')
  , minifyHTML = require('gulp-minify-html')
  , Stream = require('promisableStream')

var uid = 0

var importBundle = function(htmlString){

  var lines = htmlString.split(/\n/)
  var m, i

  for (i=0; i<lines.length; i++)
    if( (m=lines[i].match(/[\t ]*<!-- *make *bundle *\[ *([^\]]+) *\] *-->/)) )
      break

  if (i>=lines.length)
    return htmlString

  var start = i
  var bundleName = m.concat( './bundle'+(uid++) )[1]

  for (;i<lines.length;i++)
    if( (m=lines[i].match(/[\t ]*<!-- *end *bundle *-->/)) )
      break

  lines.splice( start, i-start+1, '<script src="'+bundleName+'"></script>')
  return lines.join('\n')
}
var bundleHTML = function(){

  var stream = new Stream()
  stream.writable = stream.readable = true

  var pending = 0

  stream.write = function( file ){
    file.contents = new Buffer( importBundle(file.contents.toString('utf8')) )
    this.emit('data', file)
  }
  stream.end = function(){
    this.emit('end')
  }

  return stream
}

gulp.task('build.html', function() {
  gulp.src('../sources/*.html')
  	.pipe(bundleHTML())
    .pipe(minifyHTML())
    .pipe(gulp.dest('../build/'));

  return gulp.src('../sources/templates/*.html')
    .pipe(bundleHTML())
    .pipe(gulp.dest('../build/templates/'));
});

gulp.task('build.html-indexHtml', function() {
  return gulp.src('../build/index.html')
    .pipe(gulp.dest('../'));
});
