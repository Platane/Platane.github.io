var   gulp = require('gulp')
	, requireDir = require('require-dir')
	, clean = require('gulp-clean')
	, gulpq = require('gulp-queue')
	, Stream = require('promisableStream')
	, Promise = require('promise')

requireDir('./build');

gulp.task('build.clean', function () {
	return gulp.src('../build/', {read: false})
    .pipe(clean({force:true}) )
})

gulpq.task( 'build', 
	[  'build.html'
	 , 'build.css'
	 , 'build.works-illustration'
	 , 'build.works-illustration-gif'
	 , 'build.works-illustration-thumbnails'
	 , 'build.image-assets'
	 , 'build.js'
	 , 'build.works'
	 , 'build.articles'
	 , 'build.resume'
	],
	[  'build.articles-index'
	 , 'build.html-indexHtml'
	]);