var   gulp = require('gulp')
	, htmlmin = require('gulp-html-minifier')


gulp.task('build.html', function() {
  return gulp.src('../sources/**/*.html')
  	.pipe(htmlmin())
    .pipe(gulp.dest('../build/'));
});