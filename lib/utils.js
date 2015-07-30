var SourceMapConsumer = require('source-map').SourceMapConsumer;
var atob = require('atob');
var btoa = require('btoa');

var SOURCE_MAPPING_URL_COMMENT = '//# sourceMappingURL=data:application/json;base64,';

module.exports = {
    getSourceMap: function (content) {
       return Array.isArray(content)
            ? getFromLastLine_(content)
            : getFromText_(content);

        ///
        function getFromLastLine_(lines) {
            return mkSourceMap(split(lines[lines.length - 1]).sourceMap);
        }

        ///
        function getFromText_(text) {
            return mkSourceMap(split(text).sourceMap);
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
    },

    ///
    joinContentAndSourceMap: function (content, sourceMap) {
        var sourceMapLine = SOURCE_MAPPING_URL_COMMENT + btoa(stringify_(sourceMap));
        return [content.trimRight(), sourceMapLine].join('\n');

        ///
        function stringify_(sourceMap) {
            var str = sourceMap.toString();
            return str === {}.toString() // '[object Object]'
                ? JSON.stringify(sourceMap)
                : str;
        }
    }
};

/**
 * @typedef {Object} ContentAndSourceMap
 * @property {String} content
 * @property {String|null} sourceMap base 64 encoded source map
 */
/**
 * Split text into content and source map parts
 * @param {String} text
 * @return {ContentAndSourceMap}
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

///
function mkSourceMap(base64Str) {
    return base64Str && new SourceMapConsumer(JSON.parse(atob(base64Str)));
}
