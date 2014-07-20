var es = require('event-stream')
  , gulp = require('gulp')
  , fs = require('fs')
  , path = require('path')
  , Stream = require('promisableStream')
  , rename = require('gulp-rename')
  , markdown = require('myMarkdown')
  , templating = require('./templating')

  , File = require('vinyl');

var grabArticlesInfo = function(){

	var stream = new Stream()
  	stream.writable = stream.readable = true

  	stream.write = function( file ){
  		var articles
  		try{
  			articles = JSON.parse( file.contents.toString('utf8') ).articles
  		}catch( e ){
        this.emit('error' , e )
        return false
      }

      for(var i=0,l=articles.length;i<l;i++)
        this.emit('data',{
        	previous : i<articles.length-1 ? articles[i+1] : null,
        	current : articles[i],
        	next : i==0 ? null : articles[i-1],
        })
  	} 
  	stream.end = function(){
  		this.emit('end')
  	}

  	return stream
}

var getArticleUrl = function( info ){
  return '/build/articles/'+info.title.split(' ').join('-')+'.html'
}

var parseDate = function( date ){
  date = new Date( date )
  var d = date.getDate()+"",
      m = (date.getMonth()+1)+"",
      y = date.getFullYear()+""
  while( d.length < 2 )
    d='0'+d
  while( m.length < 2 )
    m='0'+m
  return d+'/'+m+'/'+y
}

var genArticle = function(){

	var stream = new Stream()
  	stream.writable = stream.readable = true

  	var i=0;

  	stream.write = function( articleInfo ){
  		
  		i++

      templating( '../build/templates/article.html' ,
                  '../build/data/articles/'+articleInfo.current.dir+'/content.md' ,
                  function( data ){
                    var d = { 
                      title : articleInfo.current.title,
                      url : getArticleUrl( articleInfo.current ),
                      dir : articleInfo.current.dir,
                      date : parseDate( +articleInfo.current.published ), 
                      "content-md" : markdown( data ),

                      next : false,
                      previous : false
                    }

                    if( articleInfo.next )
                      d.next = {
                        url : getArticleUrl( articleInfo.next ),
                        title : articleInfo.next.title,
                        dir : articleInfo.next.dir
                      }

                    
                    if( articleInfo.previous )
                      d.previous = {
                        url : getArticleUrl( articleInfo.previous ),
                        title : articleInfo.previous.title,
                        dir : articleInfo.previous.dir
                      }
                    
                    return d
                  })
  		.on('data',function(file){
        file.path = path.join( file.base , articleInfo.current.title.split(' ').join('-')+'.html' )
  			stream.emit('data',file)
  		})
  		.on('end',function(){
        i--
  			if( end && i<=0 )
  				stream.emit('end')
  		})
  	}

  	var end=false
  	stream.end = function(){
  		if( i==0 )
  			stream.emit('end')
  		end=true;
  	}

  	return stream
}

gulp.task('gen.articles', function() {
  
  return gulp.src('../build/data/articles.json')
  .pipe( grabArticlesInfo() )
  .pipe( genArticle() )
  .pipe( gulp.dest('../build/articles/') )
  .toPromise()
})

//gulp.run('gen.articles')