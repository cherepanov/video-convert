"use strict";

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

class Reader extends EventEmitter {
    constructor(file) {
        super();

        this.file = file;

        fs.stat(file, (err, stats) => {
            if(err || !stats.isFile()) {
                throw new Error('file not found');
            }

            this.stream = fs.createReadStream(file);

            this.emit('ready');
        });

        return this;
    }

    pipe(writable) {
        return this.stream.pipe(writable);
    }
}

module.exports = Reader;