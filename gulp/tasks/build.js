var   gulp = require('gulp')
	, requireDir = require('require-dir')
	, clean = require('gulp-clean')
	, gulpq = require('gulp-queue')

requireDir('./build');

gulp.task('build.clean', function () {
	return gulp.src('../build/', {read: false})
    .pipe(clean({force:true}) );
})

gulpq.task('build', [ 'build.clean' , [ 'build.css' , 'build.html' ] , 'build.works' ] );



gulp.run('build' );