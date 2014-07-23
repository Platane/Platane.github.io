var   gulp = require('gulp')
  , gulpq = require('gulp-queue')
  , requireDir = require('require-dir')
  , watch = require('gulp-watch')
  , connect = require('gulp-connect')
  , Promise = require('promise')


requireDir('./tasks');




gulp.task('serve', function () {
	connect.server({
	    root: '../.',
	    livereload: false,
	    port : 8081
	});
});

gulpq.task( 'regen' , [ ['build.articles','build.works'] , 'gen' ] )

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

	gulp.watch('../sources/data/**/*',['regen'] )

	gulp.watch('../sources/templates/**/*',['regen'] )
	
});


gulp.task('delay', function () {
	return new Promise(function(resolve){
		setTimeout( resolve , 1000 )
	})
	
})

gulpq.task( 'fullBuild' , [ 'build.clean' , 'delay' , 'build' , 'delay' , 'gen' ] )

gulp.task('default', [ 'fullBuild' , 'watch' , 'serve' ]);