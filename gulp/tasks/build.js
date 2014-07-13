var   gulp = require('gulp')
	, requireDir = require('require-dir')
	, clean = require('gulp-clean')

requireDir('./build');

gulp.task('build.clean', function () {
	return gulp.src('../build/', {read: false})
    .pipe(clean({force:true}) );
})

gulp.task('build', [ 'build.clean' ] , function(){
	return gulp.run([ 'build.css' , 'build.html' , 'build.images' , 'build.js' , 'build.data' ])
});
