var os = require('os'),
    SourceMapConsumer = require('source-map').SourceMapConsumer,
    SourceMapGenerator = require('source-map').SourceMapGenerator,
    atob = require('atob'),
    btoa = require('btoa'),
    SOURCE_MAPPING_URL_COMMENT = 'sourceMappingURL=data:application/json;base64,';

module.exports = {
    /**
     * @param {String|String[]} content
     * @return {SourceMapConsumer}
     */
    getSourceMap: function (content) {
        return Array.isArray(content)
            ? getFromLastLine_(content)
            : getFromText_(content);

        function getFromLastLine_(lines) {
            return mkSourceMap(split(lines[lines.length - 1]).sourceMap);
        }

        function getFromText_(text) {
            return mkSourceMap(split(text).sourceMap);
        }
    },

    /**
     * Remove last line if it starts with '//# sourceMappingURL='
     * @param {String|String[]} content
     * @return {String|String[]} content without sourcemap string
     */
    removeBuiltInSourceMap: function (content) {
        return Array.isArray(content)
            ? removeFromLines_(content.concat())
            : removeFromText_(content);

        function removeFromLines_(lines) {
            if (split(lines[lines.length - 1]).sourceMap) {
                lines.pop();
            }
            return lines;
        }

        function removeFromText_(text) {
            return split(text).content;
        }
    },

    splitContentAndSourceMap: function (content) {
        var pieces = split(content);
        if (pieces.sourceMap) {
            pieces.sourceMap = mkSourceMap(pieces.sourceMap);
        }
        return pieces;
    },

    /**
     * @param {String} content
     * @param {SourceMapGenerator} sourceMap
     * @param {Object} [opts]
     * @param {String} opts.comment 'inline'|'block', 'inline' by default
     * @return {String}
     */
    joinContentAndSourceMap: function (content, sourceMap, opts) {
        sourceMap = sourceMap instanceof SourceMapGenerator
            ? sourceMap.toString()
            : JSON.stringify(sourceMap);

        opts = opts || {};
        opts.comment = opts.comment || 'inline';

        var sourceMapComment = '# ' + SOURCE_MAPPING_URL_COMMENT + btoa(sourceMap.toString()),
            sourceMapLine = opts.comment === 'inline'
                ? '//' + sourceMapComment
                : '/*' + sourceMapComment + '*/';

        return [content.trimRight(), sourceMapLine].join(os.EOL);
    }
};

/**
 * @typedef {Object} ContentAndSourceMap
 * @property {String} content
 * @property {String|null} sourceMap base64 encoded source map
 */
/**
 * Split text into content and source map parts
 * @param {String} text
 * @return {ContentAndSourceMap}
 */
function split(text) {
    var pieces = text.split(new RegExp('/(?:/|\\*)\\s*#\\s*' + SOURCE_MAPPING_URL_COMMENT));
    if (pieces.length === 1 || /(\r\n|\r|\n)\s*\S+/.test(pieces[1])) {
        return {
            content: text,
            sourceMap: null
        };
    }

    return {
        content: pieces[0].trimRight(),
        sourceMap: pieces[1].replace('*/', '').trimRight()
    };
}

function mkSourceMap(base64Str) {
    return base64Str && new SourceMapConsumer(JSON.parse(atob(base64Str)));
}
