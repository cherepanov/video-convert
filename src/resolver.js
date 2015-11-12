"use strict";

var path = require("path");

const PATH_SEP = path.sep;

//TODO: rename, incorporate all fs related funcs
class Resolver {
    static resolve(base, id, fn) {
        return [path.resolve(base), id, fn].join(PATH_SEP);
    }

    static mv(src, dest) {
        //TODO: mkdirp, check
        return new Promise((res, rej) => {
            let is = fs.createReadStream(src),
                os = fs.createWriteStream(dest);

            is.pipe(os);
            is.on('end', () => {
                fs.unlink(src, function(err){
                    if(err) {
                        rej(err);
                    }
                    res();
                });
            });
            is.on('error', rej);
        });
    }
}

module.exports = Resolver;