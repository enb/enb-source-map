var os = require('os');
var mozilla = require('source-map');
var SourceMapGenerator = mozilla.SourceMapGenerator;
var utils = require('./utils');
var getSourceMap = utils.getSourceMap;
var removeBuiltInSourceMap = utils.removeBuiltInSourceMap;

/**
 * @param {String} filename
 * @param {Object} opts
 * @param {String} opts.comment 'inline'|'block', 'inline' by default
 * @param {Boolean} opts.sourceMap
 */
function File(filename, opts) {
    // Old syntax support, where second parameter was useSourceMap
    opts = (typeof opts === 'boolean') ? {sourceMap: opts} : opts;

    opts = opts || {};
    opts.comment = opts.comment || 'inline';

    this._content = [''];
    if (opts.sourceMap) {
        this._map = new SourceMapGenerator({file: filename});
    }
    this._filename = filename;
    this._opts = opts;
}

File.prototype = {
    writeFileContent: function (filename, content) {
        this.writeFileFragment(filename, content, 1, 0);
        this._content.push('');
    },

    writeLine: function (line) {
        this.write(line + '\n');
    },

    writeContent: function (content) {
        this.write(content + '\n');
    },

    write: function (content) {
        var lines = getLines(String(content));
        this._content[this._content.length - 1] += lines.shift();
        this._content = this._content.concat(lines);
    },

    writeFileFragment: function (filename, content, lineNumber, column) {
        var lines = getLines(content);
        var subSourceMap;
        if (this._map) {
            subSourceMap = getSourceMap(lines);
        }

        lines = removeBuiltInSourceMap(lines);
        var lastLineNum = lines.length - 1;
        lines.forEach(function (line, i) {
            if (this._map) {
                this._map.addMapping({
                    source: filename,
                    original: {line: lineNumber + i, column: i === 0 ? column : 0},
                    generated: {line: this._content.length, column: i === 0 ? this.getCursor().column : 0}
                });
            }
            if (i === lastLineNum) {
                this.write(line);
            } else {
                this.writeLine(line);
            }
        }, this);

        if (this._map && subSourceMap) {
            this._map.applySourceMap(
                subSourceMap,
                filename
            );
        }
    },

    getCursor: function () {
        return {
            line: this._content.length,
            column: this._content[this._content.length - 1].length
        };
    },

    render: function () {
        var content = this._content.join(os.EOL);
        if (this._map) {
            content = utils.joinContentAndSourceMap(content, this._map, this._opts);
        }
        return content;
    }
};

function getLines(text) {
    return text.split(/\r\n|\r|\n/);
}

module.exports = File;
