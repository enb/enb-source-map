var mozilla = require('source-map');
var SourceMapGenerator = mozilla.SourceMapGenerator;
var btoa = require('btoa');
var utils = require('./utils');
var getSourceMap = utils.getSourceMap;
var removeBuiltInSourceMap = utils.removeBuiltInSourceMap;

var SOURCE_MAPPING_URL_COMMENT = '//# sourceMappingURL=data:application/json;base64,';

function File(filename, useSourceMap) {
    this._content = '';
    if (useSourceMap) {
        this._map = new SourceMapGenerator({file: filename});
        this._line = 1;
    }
    this._filename = filename;
}

File.prototype = {
    writeFileContent: function (filename, content) {
        var lineNumber = 1;
        var lines = content.split('\n');
        var subSourceMap;
        if (this._map) {
            subSourceMap = getSourceMap(lines);
        }
        lines = removeBuiltInSourceMap(lines);
        lines.forEach(function (line) {
            if (this._map) {
                this._map.addMapping({
                    source: filename,
                    original: {
                        line: lineNumber,
                        column: 0
                    },
                    generated: {
                        line: this._line,
                        column: 0
                    }
                });
                lineNumber++;
            }
            this.writeLine(line);
        }, this);
        if (this._map && subSourceMap) {
            this._map.applySourceMap(
                subSourceMap,
                filename
            );
        }
    },

    writeLine: function (line) {
        this._content += line + '\n';
        if (this._map) {
            this._line++;
        }
    },

    writeContent: function (content) {
        this._content += content + '\n';
        if (this._map) {
            var lines = content.match(/\n/g);
            this._line += lines ? lines.length + 1 : 1;
        }
    },

    render: function () {
        var res = this._content;
        if (this._map) {
            res += SOURCE_MAPPING_URL_COMMENT + btoa(this._map.toString());
        }
        return res;
    }
};

module.exports = File;
