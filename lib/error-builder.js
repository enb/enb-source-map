var fs = require('fs'),
    os = require('os'),
    SourceLocator = require('./source-locator');

module.exports = {
    generateErrorMessage: function (filename, source, message, line, column) {
        var sourceLocator = new SourceLocator(filename, source),
            pos = sourceLocator.locate(line, column),
            lines = fs.readFileSync(pos.source, 'utf8').split('\n'),
            lineNumber = pos.line - 1,
            result = [
                renderLine(lineNumber, lines[lineNumber]),
                renderPointer(pos.column)
            ],
            i = lineNumber - 1,
            linesAround = 2;

        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i]));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i]));
            i++;
        }
        result.unshift(formatErrorMessage(message, pos.source));
        return result.join(os.EOL);
    }
};

/**
 * Formats error message header.
 *
 * @param {String} message
 * @param {String} filename
 * @returns {String}
 */
function formatErrorMessage(message, filename) {
    return message +  ' at ' + filename + ' :';
}

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @returns {String}
 */
function renderLine(n, line) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, ' ');

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return ' ' + lineNumber + line;
}

/**
 * Renders pointer:
 * ---------------^
 *
 * @param {Number} column
 * @returns {String}
 */
function renderPointer(column) {
    return (new Array(column + 9)).join('-') + '^';
}
