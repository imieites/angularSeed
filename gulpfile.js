"use strict";
// Requires

var lazypipe = require('lazypipe');
var gulp = require('gulp');
var util = require('gulp-util');
var header = require('gulp-header');
var size = require('gulp-size');
var htmlhint = require("gulp-htmlhint");
var jshint = require('gulp-jshint');
var csslint = require('gulp-csslint');
var gulpif = require('gulp-if');
var htmlMinify = require('gulp-minify-html');
var htmlPrettify = require('gulp-html-prettify');
var jsUglify = require('gulp-uglify');
var jsPrettify = require('gulp-js-prettify');
var cssMinify = require('gulp-minify-css');
var cssBeautify = require('gulp-cssbeautify');
var argv = require('yargs').argv;
var browserSync = require('browser-sync').create();
var pkg = require('./package.json');
var pkgInfo = '<%= pkg.name %>@v<%= pkg.version %> || License: <%= pkg.license %> || Author: <%= pkg.author %>';

// Comments
/*  */


// Future features:
/*
inyectar dependencias bower como cdn fallback
unit testing
git pushing?
browserify: http://browserify.org/
*/


// Init Dirs

var sourceDir = "./src";


// Define environment
var outputDir;
if(!argv.prod){ // dev mode
  outputDir = './builds/dev';
  util.log("Running in Development mode.")
}
else { // prod mode: si ejecuto gulp --prod, entra en modo prod
  outputDir = './builds/prod';
  util.log("Running in Production mode.");
}

util.log("Output directory is: "+outputDir);

// Lazypipe Tasks
// note: lazypipe().pipe() takes functions without parenthesis and the arguments after the comma
// more info: https://github.com/OverZealous/lazypipe

var htmlDev = lazypipe()
  .pipe(htmlPrettify,{indent_char: ' ', indent_size: 2});

var htmlProd = lazypipe()
  .pipe(htmlMinify);

var jsDev = lazypipe()
  .pipe(jsPrettify);

var jsProd = lazypipe()
  .pipe(jsUglify);

var cssDev = lazypipe()
  .pipe(cssBeautify);

var cssProd = lazypipe()
  .pipe(cssMinify);

// Gulp Tasks

gulp.task('htmlhint', function() {
  return gulp.src(sourceDir+'/**/*.html')
    .pipe(htmlhint())
    .pipe(htmlhint.reporter('htmlhint-stylish'));
});


gulp.task('jshint', function() {
  return gulp.src(sourceDir+'/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('csslint', function() {
  return gulp.src(sourceDir+'/**/*.css')
    .pipe(csslint()) // at the moment the custom formatter for gulp-csslint isn't working
});

gulp.task('html',['htmlhint'], function() {
  return gulp.src(sourceDir+'/**/*.html')
    .pipe(size({title:'HTML files size in source:'})) // muestro el tamaño antes
    .pipe( gulpif(argv.prod, htmlProd(), htmlDev()) ) // ejecuta tareas de prod o dev
    .pipe(header("<!-- "+pkgInfo+" -->\n", { pkg : pkg }))
    .pipe(size({title:'HTML files size in dest:'})) // muestro el tamaño después
    .pipe(gulp.dest(outputDir));
});

gulp.task('js',['jshint'], function() {
  return gulp.src(sourceDir+'/**/*.js')
  .pipe(size({title:'JS files size in source:'})) // muestro el tamaño antes
  .pipe( gulpif(argv.prod, jsProd(), jsDev()) ) // ejecuta tareas de prod o dev
  .pipe(header("// "+pkgInfo+"\n", { pkg : pkg }))
  .pipe(size({title:'JS files size in dest:'})) // muestro el tamaño después
  .pipe(gulp.dest(outputDir));
});

gulp.task('css',['csslint'], function() {
  return gulp.src(sourceDir+'/**/*.css')
    .pipe(size({title:'CSS files size in source:'})) // muestro el tamaño antes
    .pipe(gulpif(argv.prod, cssProd(), cssDev()) ) // si es prod hace minify, si no hace beautify
    .pipe(header("/* "+pkgInfo+" */\n", { pkg : pkg }))
    .pipe(size({title:'CSS files size in dest:'})) // muestro el tamaño después
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
