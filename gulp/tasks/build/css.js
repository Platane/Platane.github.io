var   gulp = require('gulp')
    , stylus = require('gulp-stylus')
    , concat = require('gulp-concat')
    , jeet = require('jeet')
    , nib = require('nib')


gulp.task('css', function() {
  gulp.src('../sources/**/*.styl')
    .pipe(stylus({
        errors: true,
        //compress: true,
        use : [ 
          jeet(),
          nib()
         ]
      }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('../build/'));
});