var   gulp = require('gulp')
    , stylus = require('gulp-stylus')
    , concat = require('gulp-concat')
    , jeet = require('jeet')
    , nib = require('nib')


gulp.task('build.css', function() {
  //gulp.src('../sources/**/*.styl')
  return gulp.src( [ '../sources/home.styl' , '../sources/article-style.styl' ] )
    .pipe(stylus({
        errors: true,
        //compress: true,
        
        use : [ 
          jeet(),
          nib()
         ]
      }))
    //.pipe(concat('style.css'))
    .pipe(gulp.dest('../build/'));
});