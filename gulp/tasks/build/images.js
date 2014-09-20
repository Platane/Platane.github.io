var gulp = require('gulp')
  , Stream = require('promisableStream')
  , rename = require('gulp-rename')
  , spawn = require('child_process').spawn


var operationAsCmd = function( operations ){
    var cmd = ['convert', '-' ]

    if( operations.resize )
        cmd.push( '-resize' , operations.resize.width+'x'+operations.resize.height )


    if( operations.quality )
        cmd.push( '-quality' , operations.quality+'' )


    if( operations.noProfile )
        cmd.push( '+profile' , '"*"' )

    cmd.push( ( operations.format || 'JPG' ).toUpperCase()+ ':-' )

    return cmd
}
var alterImage = function( operations ){

    var stream = new Stream()
        stream.setMaxListeners(0) // allow adding more than 11 streams
        stream.writable = stream.readable = true


    var working = 0;
    var checkForEnd = function(){
        if(!working)
            stream.emit('end')
    }

    stream.destroy = function(){ this.emit('close') }

    stream.end = checkForEnd;

    stream.write = function( file ){

        // 
        var proc = spawn( "gm" , operationAsCmd( operations )  )

        
        // monitor the error and standard output stream 
        var buffer = []
          , stderr = ''

        proc.stdout.on('data', function (data) {
            buffer.push( data )
        })

        proc.stderr.on('data', function (data) {
            stderr += data
        })

        // listen to the operation's end
        proc.on('close', onExit = function (code, signal) {
            
            // something bad happend
            if (code !== 0 || signal !== null) {
                stream.emit('error', new Error('Command failed: ' + stderr) )
                stream.emit('close')
            };

            // everythings are ok, the new image buffer is stored in stout
            // set it, and push the file in the output pipe
            file.contents = Buffer.concat( buffer )

            // rename the image
            var h = file.path.split('.')
            h[h.length-1] = ( operations.format || 'jpg' )
            file.path = h.join('.')

            stream.emit( 'data' , file )

            // if it's the last processed file, emit end
            working --
            checkForEnd()
        });
        proc.on('error', function(err){
            stream.emit('error', new Error('Command failed: ' + stderr) )
            stream.emit('close')
        });

        // push the file buffer into the standard input stream

        working ++

        proc.stdin.write( file.contents )
        proc.stdin.end()
    }

    return stream;
}


gulp.task('build.image-assets', function() {

  return gulp.src( '../sources/assets/images/*.{jpeg,jpg,png,gif}')
      .pipe(gulp.dest('../build/assets/images/'));
});


gulp.task('build.works-illustration', function() {

  return gulp.src( '../sources/assets/works-illustrations/*.{jpeg,jpg,png}')
    
      .pipe( alterImage(
        {
            
            resize : {
                width : 720,
                height : 600
            },
            noProfile : true,
            quality : 80,
            format : 'jpg'
        }
        ))

        .pipe(gulp.dest('../build/assets/works-illustrations/'));
});

gulp.task('build.works-illustration-gif', function() {

  return gulp.src( '../sources/assets/works-illustrations/*.gif')
        .pipe(gulp.dest('../build/assets/works-illustrations/'));
});


gulp.task('build.works-illustration-thumbnails', function() {

  return gulp.src( '../sources/assets/works-illustrations/*.{jpeg,jpg,png,gif}')
      .pipe( alterImage(
        {
            
            resize : {
                width : 180,
                height : 180
            },
            noProfile : true,
            quality : 80,
            format : 'jpg'
        }
        ))
        .pipe(gulp.dest('../build/assets/works-illustrations/thumbnails/'));
});