var   gulp = require('gulp')


gulp.task('build.resume', function() {
  gulp.src('../sources/data/resume.json')
    .pipe(gulp.dest('../build/data'));
});