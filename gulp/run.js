var  gulp = require('gulp')
, requireDir = require('require-dir')

requireDir('./tasks', {recurse: true});

gulp.run('css');