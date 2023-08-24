'use strict';

const gulp = require('gulp');
const moment = require('moment');
const through = require('through2');
const replace = require('gulp-replace');
const Vinyl = require('vinyl');

module.exports = () => {
    let fileName = 'version.json';
    let parsedObject = {};

    let bufferedContents = function (file, enc, cb) {
        cb();
    };

    let endBuffer = function (cb) {
        let self = this;

        parsedObject.date = moment().format('MM/DD/YYYY H:mm:ss');
        parsedObject.version = moment().format('DDMMYYYY.Hmm');

        let buildInfo = JSON.stringify(parsedObject, null, 4);

        let file = new Vinyl({
            path: './src/' + fileName,
            contents: Buffer.from(buildInfo)
        });
        self.push(file);

        cb();
    };

    let ver = moment().format('DDMMYYYY.Hmm');
    gulp.src(['./bin/index.html'])
        .pipe(replace(/v=([^&"]+)/g, 'v=' + ver))
        .pipe(gulp.dest('./bin/'));

    gulp.src(['./src'])
        .pipe(through.obj(bufferedContents, endBuffer))
        .pipe(gulp.dest('./'));
};
