var getSourceMap = require('./utils').getSourceMap;
var path = require('path');

function SourceLocator(filename, source) {
    this._map = getSourceMap(source);
    this._filename = filename;
}

SourceLocator.prototype.locate = function (line, column) {
    if (this._map) {
        var pos = this._map.originalPositionFor({
            line: line,
            column: column
        });
        if (pos.source) {
            pos.source = path.resolve(path.dirname(this._filename), pos.source);
            return pos;
        }
    }
    return {
        source: this._filename,
        line: line,
        column: column
    };
};

module.exports = SourceLocator;