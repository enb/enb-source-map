var SourceMapConsumer = require('source-map').SourceMapConsumer;
var atob = require('atob');

var SOURCE_MAPPING_URL_COMMENT = '//# sourceMappingURL=data:application/json;base64,';

module.exports = {
    getSourceMap: function (content) {
        var lines = Array.isArray(content) ? content : getLines(content);
        if (lines[lines.length - 1].indexOf(SOURCE_MAPPING_URL_COMMENT) === 0) {
            return new SourceMapConsumer(
                JSON.parse(atob(lines[lines.length - 1].substr(SOURCE_MAPPING_URL_COMMENT.length)))
            );
        } else {
            return null;
        }
    },
    removeBuiltInSourceMap: function (content) {
        var lines = Array.isArray(content) ? content.concat() : getLines(content);
        if (lines[lines.length - 1].indexOf(SOURCE_MAPPING_URL_COMMENT) === 0) {
            lines.pop(); // //# sourceMappingURL=
        }
        return lines;
    }
};

function getLines(text) {
    return text.split(/\r\n|\r|\n/);
}
