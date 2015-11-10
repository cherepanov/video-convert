"use strict";

var path = require("path");

const PATH_SEP = path.sep;

class Resolver {
    resolve(base, id, fn) {
        return [path.resolve(base), id, fn].join(PATH_SEP);
    }
}

module.exports = Resolver;