var   gulp = require('gulp')


gulp.task('build.html', function() {
  gulp.src('../sources/**/*.html')
    .pipe(gulp.dest('../build/'));
});