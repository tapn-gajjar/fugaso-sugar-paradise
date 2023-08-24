const gulp = require('gulp');

const moment = require('moment');
const replace = require('gulp-replace');
const jeditor = require('gulp-json-editor');
const md5 = require('md5');

function version() {
    let now = moment();
    gulp.src(['./bin/index.html'])
        .pipe(replace(/\?v=([^&"]+)/g, '?v=' + String(md5(now.format('DDMMYYYY.Hmm')))))
        .pipe(gulp.dest('./bin/'));

    return gulp.src('./src/version.json')
        .pipe(jeditor((json) => {
            json.date = now.format('MM/DD/YYYY H:mm:ss');
            json.version = now.format('DDMMYYYY.Hmm');
            json.build = (json.build || 0) + 1;
            return json; // must return JSON object.
        }))
        .pipe(gulp.dest('./src')).pipe(gulp.dest('./bin'));
}

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babel = require('babelify');
const uglify = require('gulp-uglify');
const strip = require('gulp-strip-comments');

const handleErrors = require('../util/handleErrors');

function build() {
    let bundler = browserify({
        entries: ['src/index.js']
    }).transform(babel);

    return bundler.bundle()
        .on('error', handleErrors)
        .pipe(source('build.js'))
        .pipe(buffer())
        .pipe(strip())
        .pipe(uglify())
        .pipe(gulp.dest('bin'));
}

gulp.task('version', version);
gulp.task('build:release', gulp.series('version', build));
