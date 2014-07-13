var   gulp = require('gulp')


gulp.task('build.js', function() {
  gulp.src('../sources/**/*.js')
    .pipe(gulp.dest('../build/'));


  // externals
  gulp.src('../node_modules/gl-matrix/dist/gl-matrix.js')
    .pipe(gulp.dest('../build/'));
});