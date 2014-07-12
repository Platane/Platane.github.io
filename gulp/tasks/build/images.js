var   gulp = require('gulp')
	 ,imageResize = require('gulp-image-resize')



gulp.task('images', function() {
  gulp.src( '../sources/**/*.{jpeg,jpg,png}')
    .pipe(gulp.dest('../build/'));

  /*
  gulp.src( '../sources/assets/works-illustration/*.{jpeg,jpg,png}')
    .pipe(imageResize({ 
      width : 50,
      height : 50,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('../build/assets/works-illustration/thumbnails/'));
	*/
});