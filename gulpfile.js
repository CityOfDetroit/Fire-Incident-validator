var gulp = require('gulp');

var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var  minifyCSS = require('gulp-minify-css');
// var imagemin = require('gulp-imagemin');

var bases = {
 app: './',
 dist: 'dist/',
};

var paths = {
    scripts: ['src/**/*.js'],
    libs: ['src/libs/jquery/dist/jquery.js', 'scripts/libs/underscore/underscore.js', 'scripts/backbone/backbone.js'],
    styles: ['src/**/*.css'],
    html: ['src/index.html'],
    images: ['src/images/**/*'],
    extras: ['crossdomain.xml', 'humans.txt', 'manifest.appcache', 'robots.txt', 'favicon.ico'],
};

// Delete the dist directory
gulp.task('clean', function() {
 return gulp.src(bases.dist)
 .pipe(clean());
});
gulp.task('css', function() {
    gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'src/css/**/*.css'
        ])
        .pipe(minifyCSS())
        .pipe(concat('index.css'))
        .pipe(gulp.dest('web/dist/css'));
});
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/tether/dist/js/tether.min.js', 'node_modules/moment/moment.min.js'])
        .pipe(gulp.dest("src/js"))
        .pipe(browserSync.stream());
});
// Process scripts and concatenate them into one output file
gulp.task('scripts', gulp.series(function(done) {
 gulp.src(paths.scripts, {cwd: bases.app})
 .pipe(jshint())
 .pipe(jshint.reporter('default'))
//  .pipe(uglify())
 .pipe(concat('app.min.js'))
 .pipe(gulp.dest(bases.dist));
 done();
}));

// // Imagemin images and ouput them in dist
// gulp.task('imagemin', ['clean'], function() {
//  gulp.src(paths.images, {cwd: bases.app})
//  .pipe(imagemin())
//  .pipe(gulp.dest(bases.dist + 'images/'));
// });

// Copy all other files to dist directly
gulp.task('clean:copy', gulp.series(function(done) {
    // Copy html
    gulp.src(paths.html, {cwd: bases.app})
    .pipe(gulp.dest(bases.dist));

    // Copy styles
    gulp.src(paths.styles, {cwd: bases.app})
    .pipe(gulp.dest(bases.dist));

    // Copy images
    gulp.src(paths.images, {cwd: bases.app,
        base: './src/'})
    .pipe(gulp.dest(bases.dist));


 done();
}));

// gulp.task('serve', function() {
//     return gulp.src('./app/')
//     .pipe(plugin.webserver({
//         host: '0.0.0.0',
//         port: 6639,
//         livereload: true,
//         open: true,
//         fallback: './dist/index.html'
//     }));
// });

gulp.task('serve', function() {
    gulp.src('./dist').pipe(webserver({
        livereload: true,
        directoryListing: false,
        host: 'localhost',
        port: 8080,
        livereload: true,
        fallback: './dist/index.html'
    }));
});


// A development task to run anytime a file changes
gulp.task('watch', function() {
    gulp.watch('src/**/*', gulp.parallel('scripts', 'clean:copy'));
});

// Define the default task as a sequence of the above tasks
gulp.task('default', gulp.parallel('scripts', 'clean:copy', 'watch', 'serve'));


// const { src, dest } = require('gulp');
// const babel = require('gulp-babel');
// const uglify = require('gulp-uglify');
// const rename = require('gulp-rename');

// exports.default = function() {
//   return src('src/**/*.js')
//     .pipe(babel())
//     .pipe(src('vendor/*.js'))
//     .pipe(dest('build/'))
//     .pipe(uglify())
//     .pipe(rename({ extname: '.min.js' }))
//     .pipe(dest('dist/'));
// }