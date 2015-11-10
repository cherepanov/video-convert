"use strict";

var EventEmitter = require('events').EventEmitter;


//TODO:
//https://github.com/Automattic/kue/blob/master/examples/many.js
//https://github.com/audreyt/node-webworker-threads

let exec = require('child_process').exec;

class Converter extends EventEmitter {
    constructor(binPath, tmpPath) {
        super();

        this.bin = binPath;
        this.tmp = tmpPath;
    }

    process(file) {
        //TODO: work scheduler
        let bin = this.bin,
            tmp = this.tmp,
            cmd = `${bin} -i ${file} -o anim -t ${tmp}`;

        return new Promise((res, rej) => {
            exec(cmd, (err, stdout, stderr) => {
                if(err) {
                    rej(err);
                    return;
                }

                res(tmp + '/anim_r.gif');
            });
        });
    }
}

module.exports = Converter;