var   gulp = require('gulp')
    , gulpq = require('gulp-queue')
	, requireDir = require('require-dir')

requireDir('./gen');

gulpq.task( 'gen', [ 'gen.works' , 'gen.articles' ] );
