var os = require('os'),
    EOL = os.EOL,
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    mozilla = require('source-map'),
    SourceMapConsumer = mozilla.SourceMapConsumer,
    SourceMapGenerator = mozilla.SourceMapGenerator,
    utils = require('./utils');

/**
 * @param {String} filename
 * @param {Object} opts
 * @param {String} opts.comment 'inline'|'block', 'inline' by default
 * @param {String} opts.sourceRoot A root for all relative URLs in this source map
 * @param {Object|Boolean} opts.sourceMap
 *   @param {String} [opts.sourceMap.from]
 *   @param {Object} [opts.sourceMap.prev] prev source map
 */
function File(filename, opts) {
    // Old syntax support, where second parameter was useSourceMap
    opts = (typeof opts === 'boolean') ? { sourceMap: opts } : opts;

    opts = opts || {};
    opts.comment = opts.comment || 'inline';

    this._content = [''];

    if (opts.sourceMap) {
        this._map = new SourceMapGenerator({
            file: opts.sourceMap.from || path.basename(filename),
            sourceRoot: opts.sourceRoot
        });
        if (opts.sourceMap.prev) {
          this._map.applySourceMap(new SourceMapConsumer(opts.sourceMap.prev));
        }
    }
    this._opts = opts;
}

File.prototype = {
    writeFileContent: function (filename, content) {
        this.writeFileFragment(filename, content, 1, 0);
        this._content.push('');

        return this;
    },

    writeFileFromPrevMap: function (file, prev) {
        if (!prev) {
            return;
        }

        if (prev) {
            if (typeof prev === 'string') {
                return prev;
            }

            if (typeof prev === 'function') {
                var prevPath = prev(file);

                if (prevPath && fs.existsSync && fs.existsSync(prevPath)) {
                    return fs.readFileSync(prevPath, 'utf-8').toString().trim();
                } else {
                    throw new Error('Unable to load previous source map: ' + prevPath.toString());
                }
            }

            if (prev instanceof mozilla.SourceMapConsumer) {
                return mozilla.SourceMapGenerator.fromSourceMap(prev).toString();
            }

            if (prev instanceof mozilla.SourceMapGenerator) {
                return prev.toString();
            }

            if (isMap(prev)) {
                return JSON.stringify(prev);
            }

            throw new Error('Unsupported previous source map format: ' + prev.toString());
        }

        if (this.inline) {
            return this.decodeInline(this.annotation);
        }

        if (this.annotation) {
            var map = this.annotation;
            if (file) {
                map = path.join(path.dirname(file), map);
            }

            this.root = path.dirname(map);

            return (fs.existsSync && fs.existsSync(map)) ?
                fs.readFileSync(map, 'utf-8').toString().trim() :
                false;
        }
    },

    writeLine: function (line) {
        this.write(line + EOL);

        return this;
    },

    writeContent: function (content) {
        this.write(content + EOL);

        return this;
    },

    write: function (content) {
        var lines = getLines(String(content));
        this._content[this._content.length - 1] += lines.shift();
        for (var i = 0, len = lines.length; i < len; ++i) {
            this._content.push(lines[i]);
        }

        return this;
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
            var lineOffset = this._content.length - 1,
                middleDir = path.dirname(relPath) + '/';

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
        return this._content.join(EOL);
    },

    render: function () {
        return this._map
            ? utils.joinContentAndSourceMap(this.getContent(), this._map, this._opts)
            : this.getContent();
    }
};

function isMap(map) {
    if (typeof map !== 'object') {
        return false;
    }

    return typeof map.mappings === 'string' || typeof map._mappings === 'string';
}

function getLines(text) {
    return text.split(/\r\n|\r|\n/);
}

module.exports = File;
