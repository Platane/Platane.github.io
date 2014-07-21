var   gulp = require('gulp')
	, requireDir = require('require-dir')

//requireDir('./gen');
require('./gen/articles.js')

gulp.task( 'gen', [ 'gen.works' ] );
