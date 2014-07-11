var   gulp = require('gulp')
  , requireDir = require('require-dir')
  , watch = require('gulp-watch')
  , connect = require('gulp-connect')


requireDir('./tasks', {recurse: true});

gulp.task('build', [ 'css' , 'html' , 'images' , 'js'  ]);
gulp.task('default', [ 'build' , 'watch' ]);


gulp.task('reload', function () {

	connect.reload()
	
});

gulp.task('watch', function () {

	/*
	connect.server({
	    root: '../build',
	    livereload: true
	 });
*/

	gulp.watch('../sources/**/*.js',['js'] )

	gulp.watch('../sources/**/*.styl',['css'] )

	gulp.watch('../sources/**/*.html',['html'] )
	
});

