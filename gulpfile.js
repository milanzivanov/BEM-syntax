'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var del = require('del');
var rimraf = require('gulp-rimraf');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var svgmin = require('gulp-svgmin');
var svgSymbols = require('gulp-svg-symbols');
var swig = require('gulp-swig');
// var imagemin = require('gulp-imagemin');
var fs = require('graceful-fs');
var connect = require('gulp-connect');
var livereload = require('gulp-livereload');
var openBrowser = require('open');
var prettify = require('gulp-html-prettify');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
global.notify = require('gulp-notify');


// Filter for index.html
function getHtmlFiles() {
  return fs.readdirSync('./public/build').filter(function(file) {
    return file != 'index.html' && file.indexOf('.html') != -1;
  });
}

// Error function
function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

// Cleaner
gulp.task('clean', function(cb) {
  return del([
    'public/build'
    ], cb);
});

// JS build tasks
gulp.task('clean:js', function(cb) {
  return del([
    'public/build/js/**'
    ], cb);
});

gulp.task('compile:js', function() {
  return gulp.src(['public/src/js/*.js', '!public/src/js/init.js'])
    .pipe(plumber())
    .pipe(concat('all.js'))
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/js'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/js'))
});

gulp.task('js', ['clean:js', 'compile:js'], function() {
  return gulp.src('public/src/js/init.js')
    .pipe(plumber())
    .pipe(rename('init.min.js'))
    .pipe(uglify())
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/js'))
    .pipe(livereload());
});

// Html build tasks
gulp.task('clean:html', function(cb) {
  return del([
    'public/build/*.html'
    ], cb);
});

gulp.task('compile:html', function() {
  return gulp.src('public/src/markup/*.html')
    .pipe(plumber())
    .pipe(swig({
      defaults: {
        cache: false
      }
    }))
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build'))
    // .pipe(prettify({indent_char: ' ', indent_size: 2}))
    // .on('error', swallowError)
    // .pipe(gulp.dest('public/build'))
});

gulp.task('prettify', ['clean:html'], function() {
  return gulp.src('public/src/markup/*.html')
    .pipe(plumber())
    .pipe(swig({
      defaults: {
        cache: false
      }
    }))
    .pipe(gulp.dest('public/build'))
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(gulp.dest('public/build'))
});


gulp.task('html', ['clean:html', 'compile:html'], function() {
  return gulp.src('public/src/markup/index.html')
    .pipe(plumber())
    .pipe(swig({
      data: {
        files: getHtmlFiles()
      },
      defaults: {
        cache: false
      }
    }))
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build'))
    .pipe(livereload());
});

// Icons
gulp.task('clean:icons', function(cb) {
  return del([
    'public/build/icons/**'
  ], cb);
});

gulp.task('icons', ['clean:icons'], function() {
  return gulp.src('public/src/icons/*.svg')
    .pipe(plumber())
    .pipe(svgmin())
    .pipe(svgSymbols({
      templates: ['default-svg']
    }))
    .pipe(rimraf())
    .pipe(rename('icons.svg'))
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/icons'))
    .pipe(livereload());
});

// Font tasks
gulp.task('clean:fonts', function(cb) {
  return del([
    'public/build/fonts/**'
  ], cb);
});

gulp.task('fonts', ['clean:fonts'], function() {
  return gulp.src('public/src/fonts/**/*.{ttf,woff,eof,otf,eot,svg}')
    .pipe(plumber())
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/fonts'))
    .pipe(livereload());
});

// Clean images
gulp.task('clean:images', function(cb) {
  return del([
    'public/build/images/**'
  ], cb);
});

// Clean filters
gulp.task('clean:filters', function(cb) {
  return del([
    'public/build/filters/**'
  ], cb);
});

// Clean favicon
gulp.task('clean:favicon', function(cb) {
  return del([
    'public/build/favicon.ico'
  ], cb);
});

gulp.task('images', ['clean:images'], function () {
  var formatJPG = ['public/src/images/**/*'];
  return gulp.src(formatJPG)
    .pipe(plumber())
    // .pipe(imagemin({
    //   progressive: true,
    //   svgoPlugins: [{removeViewBox: false}]
    // }))
    // .on('error', swallowError)
    .pipe(gulp.dest('public/build/images'))
    .pipe(livereload());
});

gulp.task('copy:png', ['clean:images'], function () {
  var formatPNG = ['public/src/images/**/*.png'];
  return gulp.src(formatPNG)
  .pipe(plumber())
    .pipe(gulp.dest('public/build/images'))
    .pipe(livereload());
});

gulp.task('copy:filters', ['clean:filters'], function () {
  var formatSVG = ['public/src/filters/*.svg'];
  return gulp.src(formatSVG)
    .pipe(plumber())
    .pipe(gulp.dest('public/build/filters'))
    .pipe(livereload());
});

gulp.task('copy:favicon', ['clean:favicon'], function () {
  var favicon = ['public/src/favicon.ico'];
  return gulp.src(favicon)
    .pipe(plumber())
    .pipe(gulp.dest('public/build'))
    .pipe(livereload());
});

//Sass
gulp.task('clean:css', function(cb) {
  return del([
    'public/build/css/**'
  ], cb);
});

gulp.task('sass', ['clean:css'], function() {
  return gulp.src('public/src/sass/**/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'SCSS',
        message: function(err) {
          return 'Error: ' + err.message;
        }
      })
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('public/build/css'))
    .pipe(livereload());
});

// Webserver
gulp.task('webserver', ['build'], function() {
  connect.server({
    root: ['public/build', 'public']
  });

  return openBrowser('http://localhost:8080');
});

// Watcher
gulp.task('watch', ['webserver'], function() {
  livereload.listen();
  gulp.watch('public/src/markup/**/*.html', ['html']);
  gulp.watch('public/src/sass/**/*.scss', ['sass']);
  gulp.watch('public/src/js/**/*', ['js']);
  gulp.watch('public/src/icons/**/*.svg', ['icons']);
  gulp.watch('public/src/fonts/**/*.{ttf,woff,eof,eot,svg}', ['fonts']);
  gulp.watch('public/src/images/**/*', ['images']);
  gulp.watch('public/src/images/**/*', ['copy:png']);
  gulp.watch('public/src/filters/*', ['copy:filters']);
  gulp.watch('public/src/*', ['copy:favicon']);
});

// Build task
gulp.task('build', ['js', 'html', 'icons', 'fonts', 'images', 'copy:png', 'copy:filters', 'copy:favicon', 'sass']);

// Default task
gulp.task('default', ['webserver']);