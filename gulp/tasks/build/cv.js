var   gulp = require('gulp')


gulp.task('build.cv', function() {
  gulp.src('../sources/data/cv.json')
    .pipe(gulp.dest('../build/data'));
});