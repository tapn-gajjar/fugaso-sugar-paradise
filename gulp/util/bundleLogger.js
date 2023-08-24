var log = require('fancy-log');
var c = require('ansi-colors');
var prettyHrtime = require('pretty-hrtime');
var startTime;

module.exports = {
    start: function (filepath) {
        startTime = process.hrtime();
        log('Bundling', c.green(filepath) + '...');
    },

    end: function (filepath) {
        var taskTime = process.hrtime(startTime);
        var prettyTime = prettyHrtime(taskTime);
        log('Bundled', c.green(filepath), 'in', c.magenta(prettyTime));
    }
};