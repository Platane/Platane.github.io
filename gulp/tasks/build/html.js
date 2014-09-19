var   gulp = require('gulp')
	, htmlmin = require('gulp-html-minifier')


gulp.task('build.html', function() {
  return gulp.src('../sources/**/*.html')
  	.pipe(htmlmin())
    .pipe(gulp.dest('../build/'));
});

gulp.task('build.html-indexHtml', function() {
  return gulp.src('../build/index.html')
    .pipe(gulp.dest('../'));
});