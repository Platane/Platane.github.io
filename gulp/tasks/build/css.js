var   gulp = require('gulp')
    , stylus = require('gulp-stylus')
    , concat = require('gulp-concat')
    , jeet = require('jeet')
    , nib = require('nib')
    , cssmin = require('gulp-minify-css')


gulp.task('build.css', function() {
  //gulp.src('../sources/**/*.styl')
  return gulp.src( [ '../sources/home.styl' , '../sources/article-style.styl' , '../sources/works.styl' , '../sources/cv.styl' ] )
    .pipe(stylus({
        errors: true,
        compress: true,
        
        use : [ 
          jeet(),
          nib()
         ]
      }))
    .pipe(cssmin())
    .pipe(gulp.dest('../build/'));
});