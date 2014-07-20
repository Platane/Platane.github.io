var es = require('event-stream')
  , gulp = require('gulp')
  , fs = require('fs')
  , path = require('path')
  , Stream = require('stream').Stream
  , rename = require('gulp-rename')
  , File = require('vinyl');


var getFolders=function (dir){
    var files = fs.readdirSync(dir);

    for( var i=files.length;i--;)
      if( !fs.statSync( path.join( dir, files[i] )).isDirectory() )
        files.splice( i,1 )
    
    return files
}

var concatSumUp=function( dir ){

  var stream = new Stream()
  stream.setMaxListeners(0) // allow adding more than 11 streams
  stream.writable = stream.readable = true
  
  var sumup,descr,basePath,cwdPath;

  var concat = function(){
    if( !sumup || !descr )
      return;
    
    var json;

    try{
      json = JSON.parse( descr )
    }catch( e ){
      stream.emit('error' , e )
    }


    json['sum-up'] = sumup

    stream.emit( 'data' , new File({
      contents : new Buffer( JSON.stringify( json ) ),
      base: basePath,
      path: path.join( basePath , 'built.json' ),
      cwd: cwdPath,
    }));
    stream.emit( 'end' );
  }



  gulp.src(   path.join( dir , 'sum-up.md' ) )
  .on('data' , function( data ){ 
    sumup = data.contents.toString('utf8');
    basePath = data.base
    cwdPath = data.cwd
    concat();
  })
  .on('end' , concat )
  .on('error' , function(e){
    stream.emit('error' , e )
  })

  gulp.src(   path.join( dir , 'data.json' ) )
  .on('data' , function( data ){ 
    descr = data.contents.toString('utf8');
    concat();
  })
  .on('end' , concat )
  .on('error' , function(e){
    stream.emit('error' , e )
  })

  return stream;
}

var concatJson=function( opts ){
  var stream = new Stream()
  stream.setMaxListeners(0) // allow adding more than 11 streams
  stream.writable = stream.readable = true

  var cwdPath,basepath,json = {
    build : new Date().getTime(),
    works : [

    ]
  }



  stream.write = function( data ){
    json.works.push(  JSON.parse( data.contents.toString('utf8') ) )
    cwdPath = data.cwd

    if( !basepath )
      basepath = data.base
    else{
      var comon = path.normalize( basepath ).split('/'),
          current = path.normalize( data.base ).split('/'),
          i

      for(i=0;i<comon.length && comon[i]==current[i] ; i++ );

      basepath = comon.slice(0,i).join('/')
    }

  }

  stream.end = function(){
    stream.emit('data',new File({
      contents : new Buffer( JSON.stringify( json ) ),
      base: basepath,
      path: path.join( basepath , 'concatened.json' ),
      cwd: cwdPath,
    }));
    stream.emit('end')
  }

  return stream;
}

var forEachFolder=function( opts , fn ){
  var p;
  if( typeof opts == 'string')
    p = opts

  fn = fn || opts.fn || function( dir ){ var s=new Stream();s.emit('data',dir);s.emit('end');return s }

  var folders = getFolders( p );

  var streams = [];

  for( var i=folders.length;i--;){
    streams.push( 
      fn( path.join( p , folders[i] ) )
    )
  }

  return es.concat.apply( null , streams )
}

gulp.task('build.works', function() {
  
  return forEachFolder( '../sources/data/works/' , concatSumUp )
  .pipe( concatJson() )
  .pipe( rename('works.json') )
  .pipe( gulp.dest('../build/data/') )
})
