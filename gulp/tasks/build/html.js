var   gulp = require('gulp')


gulp.task('html', function() {
  gulp.src('../sources/**/*.html')
    .pipe(gulp.dest('../build/'));
});