const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babel = require('babelify');
const browserSync = require('browser-sync').create();

const bundleLogger = require('../util/bundleLogger');
const handleErrors = require('../util/handleErrors');

gulp.task('dev', () => {
    let bundler = browserify({
        entries: ['src/index.js'],
        debug: true
    }).transform(babel);

    bundler.plugin(watchify, {
        delay: 100,
        ignoreWatch: ['**/node_modules/**'],
        poll: false
    });

    browserSync.init({
        port: 3000,
        server: {
            baseDir: ['bin', '../fugaso-tournaments']
        },
        ui: {
            port: 3001
        }
    });

    function rebundle() {
        bundleLogger.start('build.js');

        bundler.bundle()
            .on('error', handleErrors)
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('bin'))
            .on('end', function () {
                bundleLogger.end('done build.js');
                browserSync.reload();
            });
    }

    bundler.on('update', rebundle);
    rebundle();
});
