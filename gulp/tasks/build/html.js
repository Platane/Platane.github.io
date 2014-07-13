var   gulp = require('gulp')


gulp.task('build.html', function() {
  return gulp.src('../sources/**/*.html')
    .pipe(gulp.dest('../build/'));
});