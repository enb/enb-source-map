var os = require('os');
var path = require('path');
var url = require('url');
var mozilla = require('source-map');
var SourceMapGenerator = mozilla.SourceMapGenerator;
var utils = require('./utils');

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
        this._map = new SourceMapGenerator({file: path.basename(filename)});
    }
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

    /**
     * @param {String} relPath relative from file being added to processed file
     * @param {String} content
     * @param {Number} lineNumber
     * @param {Number} column
     */
    writeFileFragment: function (relPath, content, lineNumber, column) {
        var data = utils.splitContentAndSourceMap(content);

        if (this._map && data.sourceMap) {
            var lineOffset = this._content.length - 1;
            var middleDir = path.dirname(relPath) + '/';

            data.sourceMap.eachMapping(function (mapping) {
                this._map.addMapping({
                    source: url.resolve(middleDir, mapping.source), // make source relative to processed file
                    original: {line: mapping.originalLine, column: mapping.originalColumn},
                    generated: {line: lineOffset + mapping.generatedLine, column: mapping.generatedColumn}
                });
            }.bind(this));
        }

        var lines = getLines(data.content);
        var lastLineNum = lines.length - 1;
        lines.forEach(function (line, i) {
            if (this._map && !data.sourceMap) {
                this._map.addMapping({
                    source: relPath,
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
