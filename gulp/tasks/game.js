const gulp = require('gulp');
const concat = require('gulp-concat');
const poEditor = require('../poeditor/script/index');

async function compileBuild() {
    await poEditor.generateLocaleFromPO();
    await poEditor.updateLocalLanguages();
    gulp.src([
        './bin/lib/pixi-legacy.min.js',
        './bin/lib/OMY.min.js',
        './bin/build.js'
    ])
        .pipe(concat('game.js'))
        .pipe(gulp.dest('./bin/'));
}

gulp.task('game', function () {
    return compileBuild();
});
