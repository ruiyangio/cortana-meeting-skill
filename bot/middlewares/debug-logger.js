function debug() {
    var fs = require('fs');
    var util = require('util');
    var logger = require('./request-logger-middleware');
    var logFile = fs.createWriteStream('log.txt', { flags: 'a' });

    // Or 'w' to truncate the file every time the process starts.
    var logStdout = process.stdout;

    logger.log = function(value, title) {
        if (title) {
            title =
                '----------------------------' +
                title +
                '----------------------------';
        } else {
            title = '';
        }

        let val = JSON.stringify(value);

        // file log
        logFile.write(title + '\n');
        logFile.write(val + '\n');

        // console log
        logStdout.write(title + '\n');
        logStdout.write(val + '\n');
    };
}

module.exports = {
    debug: debug
};
