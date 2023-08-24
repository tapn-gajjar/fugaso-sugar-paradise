const gulp = require('gulp');
const poEditor = require('../poeditor/script/index');

gulp.task('local:sort language files', () => poEditor.sortLanguages());
gulp.task('local:generate hash', async () => await poEditor.generateHash());
gulp.task('local:update hash', async () => await poEditor.updateHash());
// gulp.task('spreadsheet:add from standard', async () => await poEditor.addFromStandardToSpreadsheet());
// gulp.task('spreadsheet:update from standard', async () => await poEditor.updateFromStandardToSpreadsheet());
gulp.task('spreadsheet:add from locale', async () => await poEditor.addFromLocaleToSpreadsheet());
gulp.task('spreadsheet:update from locale', async () => await poEditor.updateFromLocaleToSpreadsheet());
gulp.task('spreadsheet:get', async () => await poEditor.getFromSpreadsheet());
// gulp.task('poEditor:refresh PO', async () => await poEditor.refreshPO());
// gulp.task('poEditor:generate locale from PO', async () => await poEditor.generateLocaleFromPO());
// gulp.task('poEditor:update languages', async () => await poEditor.updateLocalLanguages());
