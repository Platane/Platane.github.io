var   gulp = require('gulp')
	, requireDir = require('require-dir')

requireDir('./gen');


gulp.task( 'gen', [ 'gen.works' , 'gen.articles' ] );
