var os = require('os'),
    path = require('path'),
    url = require('url'),
    mozilla = require('source-map'),
    SourceMapGenerator = mozilla.SourceMapGenerator,
    SourceMapConsumer = mozilla.SourceMapConsumer,
    utils = require('./utils');

/**
 * @param {String} filename
 * @param {Object} opts
 * @param {String} opts.comment 'inline'|'block', 'inline' by default
 * @param {Boolean} opts.sourceMap
 */
function File(filename, opts) {
    // Old syntax support, where second parameter was useSourceMap
    opts = (typeof opts === 'boolean') ? { sourceMap: opts } : opts;

    opts = opts || {};
    opts.comment = opts.comment || 'inline';

    this._content = [''];
    if (opts.sourceMap) {
        this._map = new SourceMapGenerator({ file: path.basename(filename) });
    }
    this._opts = opts;
}

File.prototype = {
    writeFileContent: function (filename, content, opts) {
        this.writeFileFragment(filename, content, 1, 0, opts);
        this._content.push('');

        return this;
    },

    writeLine: function (line) {
        this.write(line + '\n');

        return this;
    },

    writeContent: function (content) {
        this.write(content + '\n');

        return this;
    },

    write: function (content) {
        var lines = getLines(String(content));
        this._content[this._content.length - 1] += lines.shift();
        this._content = this._content.concat(lines);

        return this;
    },

    /**
     * @param {String} relPath relative from file being added to processed file
     * @param {String} content
     * @param {Number} lineNumber
     * @param {Number} column
     * @param {Object} opts
     * @param {String|Object|SourceMapConsumer|SourceMapGenerator} opts.prevMap
     */
    writeFileFragment: function (relPath, content, lineNumber, column, opts) {
        if (!opts) {
            opts = {};
        }

        var data = utils.splitContentAndSourceMap(content);

        if (this._map && (data.sourceMap || opts.prevMap)) {
            var lineOffset = this._content.length - 1,
                middleDir = path.dirname(relPath) + '/';

            if (!data.sourceMap && opts.prevMap) {
                var prevMap = opts.prevMap;

                if (typeof prevMap === 'string') {
                    data.sourceMap = utils.mkSourceMap(prevMap);
                } else if (prevMap instanceof SourceMapConsumer) {
                    data.sourceMap = prevMap;
                } else if (prevMap instanceof SourceMapGenerator) {
                    data.sourceMap = prevMap;
                } else if (utils.isMap(prevMap)) {
                    data.sourceMap = JSON.stringify(prevMap);
                } else {
                    throw new Error('Unsupported previous source map format: ' +
                        prevMap.toString());
                }
            }

            data.sourceMap.eachMapping(function (mapping) {
                this._map.addMapping({
                    source: url.resolve(middleDir, mapping.source), // make source relative to processed file
                    original: { line: mapping.originalLine, column: mapping.originalColumn },
                    generated: { line: lineOffset + mapping.generatedLine, column: mapping.generatedColumn }
                });
            }.bind(this));
        }

        var lines = getLines(data.content),
            lastLineNum = lines.length - 1;
        lines.forEach(function (line, i) {
            if (this._map && !data.sourceMap) {
                this._map.addMapping({
                    source: relPath,
                    original: { line: lineNumber + i, column: i === 0 ? column : 0 },
                    generated: { line: this._content.length, column: i === 0 ? this.getCursor().column : 0 }
                });
            }
            if (i === lastLineNum) {
                this.write(line);
            } else {
                this.writeLine(line);
            }
        }, this);

        return this;
    },

    getCursor: function () {
        return {
            line: this._content.length,
            column: this._content[this._content.length - 1].length
        };
    },

    /**
     * Returns sourceMap if it exists. null otherwise
     * @returns {Object}
     */
    getSourceMap: function () {
        return this._map ? JSON.parse(this._map.toString()) : null;
    },

    /**
     * Returns content joined with EOL.
     * @returns {String}
     */
    getContent: function () {
        return this._content.join(os.EOL);
    },

    render: function () {
        return this._map
            ? utils.joinContentAndSourceMap(this.getContent(), this._map, this._opts)
            : this.getContent();
    }
};

function getLines(text) {
    return text.split(/\r\n|\r|\n/);
}

module.exports = File;
