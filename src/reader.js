"use strict";

var fs = require('fs');

class Reader {
    constructor(file) {
        this.file = file;

        console.log(file);
    }

    open() {
        return new Promise((res, rej) => {
            fs.stat(this.file, (err, stats) => {
                if(err || !stats.isFile()) {
                    rej('file not found');
                    return;
                }

                this.stream = fs.createReadStream(this.file);

                res('ready');
            });
        });
    }

    pipe(writable) {
        return this.stream.pipe(writable);
    }
}

module.exports = Reader;