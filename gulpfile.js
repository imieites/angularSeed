// Requires

var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var argv = require('yargs').argv;
var browserSync = require('browser-sync').create();

// Comments
/*  */


// To do:
// html, js, css prettify y uglify segun corresponda
// inyectar dependencias bower como cdn fallback
// ver en ponyfoo los comments que le agrega a los minified, ver que los tome de un archivo
// ver ponyfoo: https://ponyfoo.com/articles/choose-grunt-gulp-or-npm y https://ponyfoo.com/articles/my-first-gulp-adventure
// ver https://www.npmjs.com/package/gulp-htmlhint
// browserify: http://browserify.org/


// Init

var sourceDir = "./src";

if(!argv.prod){ // dev mode
  outputDir = './builds/dev';
  gutil.log("Running in Development mode.")
}
else { // prod mode: si ejecuto gulp --prod, entra en modo prod
  outputDir = './builds/prod';
  gutil.log("Running in Production mode.")
}

gutil.log("Output directory is: "+outputDir);

// Tasks

gulp.task('jshint', function() {
  return gulp.src(sourceDir+'/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js',['jshint'], function() {
  return gulp.src(sourceDir+'/**/*.js')
    //.pipe(gulpif(argv.prod, uglify(), prettify())) // si es prod hace uglify, si no hace prettify
    .pipe(gulp.dest(outputDir));
});

gulp.task('html', function() {
  return gulp.src(sourceDir+'/**/*.html')
    //.pipe(gulpif(argv.prod, uglify(), prettify())) // si es prod hace uglify, si no hace prettify
    .pipe(gulp.dest(outputDir));
});

gulp.task('css', function() {
  return gulp.src(sourceDir+'/**/*.css')
    //.pipe(gulpif(argv.prod, uglify(), prettify())) // si es prod hace uglify, si no hace prettify
    .pipe(gulp.dest(outputDir));
});


// Server

gulp.task('server',['html','css','js'], function() {
  browserSync.init({
      server: {
          baseDir: outputDir
      }
  });

  // watching for changes
  gulp.watch(sourceDir + "/**/*.html",['html'], browserSync.reload);
  gulp.watch(sourceDir + "/**/*.js", ['js'], browserSync.reload);
  gulp.watch(sourceDir + "/**/*.css", ['css'], browserSync.reload);

});

// Default

gulp.task('default', ['server']);
