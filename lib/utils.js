var SourceMapConsumer = require('source-map').SourceMapConsumer;
var atob = require('atob');

var SOURCE_MAPPING_URL_COMMENT = '//# sourceMappingURL=data:application/json;base64,';

module.exports = {
    getSourceMap: function (content) {
       return Array.isArray(content)
            ? getFromLastLine_(content)
            : getFromText_(content);

        ///
        function getFromLastLine_(lines) {
            return mkSourceMap_(split(lines[lines.length - 1]).sourceMap);
        }

        ///
        function getFromText_(text) {
            return mkSourceMap_(split(text).sourceMap);
        }

        ///
        function mkSourceMap_(str) {
            return str && new SourceMapConsumer(JSON.parse(atob(str)));
        }
    },

    // Remove last line if starts with '//# sourceMappingURL='
    removeBuiltInSourceMap: function (content) {
        return Array.isArray(content)
            ? removeFromLines_(content.concat())
            : removeFromText_(content);

        ///
        function removeFromLines_(lines) {
            if (split(lines[lines.length - 1]).sourceMap) {
                lines.pop();
            }
            return lines;
        }

        ///
        function removeFromText_(text) {
            return split(text).content;
        }
    }
};

/**
 * Split text into content and source map parts
 * @param {String} text
 * @return {Object} {content: 'content without source map', sourceMap: 'base64 encoded source map'|null}
 */
function split(text) {
    var pieces = text.split(SOURCE_MAPPING_URL_COMMENT);
    if (pieces.length === 1 || /(\r\n|\r|\n)\s*\S+/.test(pieces[1])) {
        return {
            content: text,
            sourceMap: null
        };
    }

    return {
        content: pieces[0].trimRight(),
        sourceMap: pieces[1].trim()
    };
}
