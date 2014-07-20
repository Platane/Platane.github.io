var   gulp = require('gulp')
  , requireDir = require('require-dir')
  , watch = require('gulp-watch')
  , connect = require('gulp-connect')


requireDir('./tasks');

gulp.task('default', [ 'build' , 'watch' ]);


gulp.task('serve', function () {
	connect.server({
	    root: '../.',
	    livereload: false,
	    port : 8081
	});
});

gulp.task('watch', function () {

	/*
	connect.server({
	    root: '../build',
	    livereload: true
	 });
*/

	gulp.watch('../sources/**/*.js',['build.js'] )

	gulp.watch('../sources/**/*.styl',['build.css'] )

	gulp.watch('../sources/**/*.html',['build.html'] )

	gulp.watch('../sources/data/**/*',['build'] )

	gulp.watch('../sources/templates/**/*',['gen'] )
	
});