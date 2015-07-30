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

    // Remove last line if starts with '//# sourceMappingURL='
    removeBuiltInSourceMap: function (content) {
        return Array.isArray(content)
            ? removeFromLines_(content.concat())
            : removeFromText_(content);

        ///
        function removeFromLines_(lines) {
            if (lines[lines.length - 1].indexOf(SOURCE_MAPPING_URL_COMMENT) === 0) {
                lines.pop();
            }
            return lines;
        }

        ///
        function removeFromText_(text) {
            var pieces = text.split(SOURCE_MAPPING_URL_COMMENT);
            return pieces.length === 1 || getLines(pieces[1]).length > 1
                ? text
                : pieces[0].trimRight();
        }
    }
};

function getLines(text) {
    return text.split(/\r\n|\r|\n/);
}
